import prisma from "../../infrastructure/database/prisma/client";
import { Order } from "../../types/common";

export function getOrdersDB() {
  return prisma.order.findMany({
    include: {
      items: true,
      table: true,
      user: true,
    },
  });
}

export function findOrderByIdDB(id: number) {
  return prisma.order.findFirst({
    where: { id },
    include: {
      items: true,
      table: true,
      user: true,
    },
  });
}

export function createOrderDB(data: Order) {
  const { items } = data;
  return prisma.order.create({
    data: {
      ...data,
      items: {
        connect: items.map((item) => ({ id: item.id })),
      },
    },
    include: {
      items: true,
      table: true,
      user: true,
    },
  });
}

export function updateOrderDB(id: number, data: Order) {
  const { items } = data;
  return prisma.order.update({
    where: {
      id,
    },
    data: {
      ...data,
      items: {
        connect: items.map((item) => ({ id: item.id })),
      },
    },
    include: {
      items: true,
      table: true,
      user: true,
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
      table: true,
      user: true,
    },
  });
}
