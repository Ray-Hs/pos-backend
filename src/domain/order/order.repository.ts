import prisma from "../../infrastructure/database/prisma/client";
import { Order, TxClientType } from "../../types/common";
import { getConstantsDB } from "../constants/constants.repository";
import { calculateTotal } from "../invoice/invoice.repository";

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

export function findOrderByIdDB(id: number, client: TxClientType) {
  return client.order.findFirst({
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
      table: true,
      items: {
        include: {
          menuItem: {
            include: {
              Printer: true,
            },
          },
        },
      },
      Invoice: {
        include: {
          invoices: { include: { user: true }, orderBy: { version: "desc" } },
        },
      },
    },
  });
}

export function findOrderByTableIdDB(id: number) {
  return prisma.order.findFirst({
    where: { tableId: id },
    orderBy: { updatedAt: "desc" },
    include: {
      table: true,
      items: {
        include: {
          menuItem: {
            include: {
              Printer: true,
            },
          },
        },
      },
      Invoice: {
        include: {
          invoices: { include: { user: true }, orderBy: { version: "desc" } },
        },
      },
    },
  });
}

export function findOldOrdersByTableIdDB(id: number) {
  return prisma.order.findMany({
    where: { tableId: id },
    orderBy: [
      { updatedAt: "desc" }, // newest first
      { id: "desc" }, // tie‐breaker
    ],
    include: {
      table: true,
      items: {
        include: {
          menuItem: {
            include: {
              Printer: true,
            },
          },
        },
      },
      Invoice: {
        include: {
          invoices: { include: { user: true }, orderBy: { version: "desc" } },
        },
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
                notes: item.notes,
              })),
            }
          : undefined,
      },
      include: {
        user: true,
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

    const constants = await getConstantsDB(tx);
    const subtotal = order.items.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );
    const total = calculateTotal(subtotal, constants);

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
        paymentMethod: "CASH",
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
  data: Order & { invoiceId: number },
  client: TxClientType
) {
  const { items, userId, reason, invoiceId, ...rest } = data;

  return client.order.update({
    where: {
      id,
    },
    data: {
      ...rest,
      userId,
      items: items
        ? {
            connectOrCreate: items.map((item) => ({
              where: { id: item.id },
              create: {
                menuItemId: item.menuItemId,
                price: item.price,
                quantity: item.quantity,
              },
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
