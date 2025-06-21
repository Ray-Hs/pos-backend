import prisma from "../../infrastructure/database/prisma/client";
import { Order } from "../../types/common";
import { getConstantsDB } from "../constants/constants.repository";
import { calculateTotal } from "../invoice/invoice.repository";
import { getPrinterByIdDB } from "../settings/printers/printer.repository";
import { printerService } from "../settings/printers/printer.services";

export function getOrdersDB() {
  return prisma.order.findMany({
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });
}

export function findOrderByIdDB(id: number) {
  return prisma.order.findFirst({
    where: { id },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      Invoice: true,
    },
  });
}
export function getLatestOrderDB(id: number) {
  return prisma.order.findFirst({
    where: { tableId: id },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      Invoice: {
        include: { invoices: { orderBy: { version: "desc" } } },
      },
    },
  });
}

export function findOrderByTableIdDB(id: number) {
  return prisma.order.findFirst({
    where: { tableId: id },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      Invoice: {
        include: { invoices: { orderBy: { version: "desc" } } },
      },
    },
  });
}

export async function createOrderDB(data: Order) {
  const { items, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        ...rest,
        items: items
          ? {
              create: items.map((item) => ({
                menuItemId: item.menuItemId,
                price: item.price,
                quantity: item.quantity,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                Printer: true,
              },
            },
          },
        },
      },
    });

    const constants = await getConstantsDB();
    const subtotal = order.items.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );
    const total = calculateTotal(subtotal, constants);

    //TODO: Send orders to correct printers
    // const printPromises = order.items.map(async (item) => {
    //   try {
    //     const printer = await getPrinterByIdDB(
    //       item?.menuItem?.Printer?.id || 0
    //     );
    //     console.log("Printer Device: ", printer);

    //     if (printer) {
    //       const printerServices = new printerService();
    //       console.log("Order Item ID: ", item.id);
    //       const response = await printerServices.print(printer.id, {
    //         orderId: order.id,
    //         item: {
    //           title_en: item.menuItem.title_en,
    //           quantity: item.quantity,
    //           price: item.price,
    //         },
    //         subtotal,
    //         total,
    //         tax: constants.tax?.rate,
    //         service: constants.service?.amount,
    //       });
    //       console.log("Print response:", response);
    //       return response;
    //     }
    //     return null;
    //   } catch (error) {
    //     console.error("Print error for item:", item.id, error);
    //     return null;
    //   }
    // });

    // // Wait for all print operations to complete
    // await Promise.all(printPromises);

    const invoiceRef = await tx.invoiceRef.create({
      data: { orderId: order.id },
    });
    const invoice = await tx.invoice.create({
      data: {
        subtotal,
        total,
        version: 1,
        invoiceRefId: invoiceRef.id,
        userId: order.userId,
        isLatestVersion: true,
        serviceId: constants.service?.id,
        taxId: constants.tax?.id,
        tableId: order.tableId,
      },
    });

    await tx.table.update({
      where: {
        id: order.tableId ?? undefined,
      },
      data: {
        status: "OCCUPIED",
      },
    });

    return {
      order,
      invoice,
    };
  });
}

export async function updateOrderDB(
  id: number,
  data: Order & { invoiceId: number }
) {
  const { items, userId, reason, invoiceId, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const prev_order = await findOrderByIdDB(id);
    const order_items = prev_order?.items;

    if (!prev_order) {
      throw new Error("No Previous Order");
    }

    const deletedItems = order_items?.filter(
      (orderItem) => !items.some((item) => item.id === orderItem.id)
    );
    const addedItems = items.filter(
      (item) => !order_items?.some((orderItem) => orderItem.id === item.id)
    );

    if (deletedItems && deletedItems.length > 0) {
      // First, delete the order items to avoid violating required relation
      await tx.orderItem.deleteMany({
        where: {
          id: {
            in: deletedItems?.map((item) => item.id),
          },
        },
      });

      // Then, create deletedOrderItems for audit/history
      await tx.deletedOrderItem.createMany({
        data: deletedItems.map((item) => ({
          orderId: id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes ?? null,
          invoiceId,
          sortOrder: item.sortOrder ?? undefined,
          createdAt: item.createdAt ?? undefined,
          reason: data.reason || "", // or another appropriate reason
        })),
      });
    }

    const order = await tx.order.update({
      where: {
        id,
      },
      data: {
        ...rest,
        userId,
        items: items
          ? {
              create: addedItems.map((item) => ({
                menuItemId: item.menuItemId,
                price: item.price,
                quantity: item.quantity,
              })),
            }
          : undefined,
      },
      include: {
        items: true,
        Invoice: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const constants = await getConstantsDB();
    const subtotal = order.items.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );

    const total = calculateTotal(subtotal, constants);
    const invoiceRef = order.Invoice[0].id;
    const invoicesFromRef = await tx.invoice.findMany({
      where: {
        invoiceRefId: invoiceRef,
      },
    });
    const version = Math.max(
      ...invoicesFromRef.map((invoice) => invoice.version)
    );

    //? Update old Invoice version Status
    await tx.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        isLatestVersion: false,
      },
    });
    //? Create new invoice and assign it into invoiceRef
    const invoice = await tx.invoice.create({
      data: {
        subtotal,
        total,
        version: version + 1,
        invoiceRefId: invoiceRef,
        userId: order.userId,
        isLatestVersion: true,
        serviceId: constants.service?.id,
        taxId: constants.tax?.id,
        tableId: order.tableId,
      },
    });

    return { order, invoice };
  });
}

export function deleteOrderDB(id: number) {
  return prisma.order.delete({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });
}
