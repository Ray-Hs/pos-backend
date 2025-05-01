import prisma from "../../infrastructure/database/prisma/client";
import { Table } from "../../types/common";

export function getTablesDB() {
  return prisma.table.findMany({
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}

export function findTableByIdDB(id: number) {
  return prisma.table.findFirst({
    where: {
      id,
    },
  });
}

export function createTableDB(data: Table) {
  const { orders } = data;
  return prisma.table.create({
    data: {
      ...data,
      orders: {
        connect: orders?.map((order) => ({ id: order.id })),
      },
    },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}

export function updateTableDB(id: number, data: Table) {
  const { orders } = data;
  return prisma.table.update({
    where: {
      id,
    },
    data: {
      ...data,
      orders: {
        connect: orders?.map((order) => ({ id: order.id })),
      },
    },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}

export function deleteTableDB(id: number) {
  return prisma.table.delete({
    where: {
      id,
    },
    include: {
      orders: {
        include: {
          items: true,
        },
      },
    },
  });
}
