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

// TODO fix or add tableId

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
    const menuItems = await Promise.all(
      items.map((item) => {
        return tx.menuItem.findFirst({
          where: {
            id: item.menuItemId,
          },
        });
      })
    );

    const itemMap = new Map<string, number>();

    for (const item of menuItems) {
      const name = item?.title_en?.toLowerCase(); // normalize for case-insensitive match
      if (!name) continue;
      const prevQty = itemMap.get(name) ?? 0;
      itemMap.set(name, prevQty + 1); // adjust this field name if needed
    }

    // 2. Update supplies accordingly
    const supplies = await Promise.all(
      Array.from(itemMap.entries()).map(async ([name, totalQty]) => {
        // Find all supplies with the same name
        const allSupplies = await tx.supply.findMany({
          where: {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
          orderBy: {
            remainingQuantity: "asc", // Start with supplies that have less quantity
          },
        });

        if (allSupplies.length === 0) return null;

        let remainingQtyToDeduct = totalQty;

        // Deduct from supplies sequentially until we've deducted all needed quantity
        for (const supply of allSupplies) {
          if (remainingQtyToDeduct <= 0) break;

          const currentQty = supply.remainingQuantity || 0;
          const qtyToDeduct = Math.min(currentQty, remainingQtyToDeduct);

          await tx.supply.update({
            where: { id: supply.id },
            data: {
              remainingQuantity: Math.max(0, currentQty - qtyToDeduct),
            },
          });

          remainingQtyToDeduct -= qtyToDeduct;
        }

        return allSupplies[0]; // Return the first supply for reference
      })
    );

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

  // Get the existing order to calculate supply differences
  const existingOrder = await client.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  // Calculate old quantities by menu item name
  const oldItemMap = new Map<string, number>();
  for (const orderItem of existingOrder.items) {
    const name = orderItem.menuItem?.title_en?.toLowerCase();
    if (!name) continue;
    const prevQty = oldItemMap.get(name) ?? 0;
    oldItemMap.set(name, prevQty + 1);
  }

  const menuItems = await Promise.all(
    items.map((item) => {
      return client.menuItem.findFirst({
        where: {
          id: item.menuItemId,
        },
      });
    })
  );

  // Calculate new quantities by menu item name
  const newItemMap = new Map<string, number>();
  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const name = item?.title_en?.toLowerCase();
    if (!name) continue;
    const prevQty = newItemMap.get(name) ?? 0;
    newItemMap.set(name, prevQty + 1);
  }

  // Calculate the difference and update supplies
  const allItemNames = new Set([...oldItemMap.keys(), ...newItemMap.keys()]);

  const supplies = await Promise.all(
    Array.from(allItemNames).map(async (name) => {
      const oldQty = oldItemMap.get(name) ?? 0;
      const newQty = newItemMap.get(name) ?? 0;
      const qtyDifference = newQty - oldQty; // positive means more items, negative means fewer

      if (qtyDifference === 0) return null;
      console.log("Quantity: ", qtyDifference);

      if (qtyDifference > 0) {
        // Need to deduct more items - check all supplies with same name
        const allSupplies = await client.supply.findMany({
          where: {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
          orderBy: {
            remainingQuantity: "asc", // Start with supplies that have less quantity
          },
        });

        if (allSupplies.length === 0) return null;

        let remainingQtyToDeduct = qtyDifference;

        // Deduct from supplies sequentially until we've deducted all needed quantity
        for (const supply of allSupplies) {
          if (remainingQtyToDeduct <= 0) break;

          const currentQty = supply.remainingQuantity || 0;
          const qtyToDeduct = Math.min(currentQty, remainingQtyToDeduct);

          await client.supply.update({
            where: { id: supply.id },
            data: {
              remainingQuantity: Math.max(0, currentQty - qtyToDeduct),
            },
          });

          remainingQtyToDeduct -= qtyToDeduct;
        }
      } else {
        // Need to add back items - find the first supply and add back
        const supply = await client.supply.findFirst({
          where: {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
        });

        if (supply) {
          const currentRemaining = supply.remainingQuantity || 0;
          const newRemainingQty = currentRemaining + Math.abs(qtyDifference);

          await client.supply.update({
            where: { id: supply.id },
            data: {
              remainingQuantity: newRemainingQty,
            },
          });
        }
      }

      return null; // Return null since we're handling multiple supplies
    })
  );

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
