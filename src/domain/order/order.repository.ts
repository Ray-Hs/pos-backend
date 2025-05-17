import { Prisma } from "@prisma/client";
import prisma from "../../infrastructure/database/prisma/client";
import { Order } from "../../types/common";

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
    where: { id },
    orderBy: {
      createdAt: "desc",
    },
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
    },
  });
}

export async function createOrderDB(data: Order) {
  const { items, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    // If there's a tableId, verify table status first
    if (rest.tableId) {
      const table = await tx.table.findUnique({
        where: { id: rest.tableId },
      });

      if (table?.status === "OCCUPIED") {
        throw new Error("Table is already occupied");
      }
    }

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
            menuItem: true,
          },
        },
      },
    });

    if (order.tableId) {
      await tx.table.update({
        where: {
          id: order.tableId,
        },
        data: {
          status: "OCCUPIED",
        },
      });
    }

    return order;
  });
}

export async function updateOrderDB(id: number, data: Order) {
  const { items, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: {
        id,
      },
      data: {
        ...rest,
        items: items
          ? {
              updateMany: items.map((item) => ({
                where: {
                  id: item.id,
                },
                data: {
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
      },
    });

    return order;
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
