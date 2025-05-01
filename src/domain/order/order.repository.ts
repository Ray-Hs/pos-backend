import { Prisma } from "@prisma/client";
import prisma from "../../infrastructure/database/prisma/client";
import { Order } from "../../types/common";

export function getOrdersDB(include?: Prisma.OrderInclude) {
  return prisma.order.findMany({
    include: {
      ...include,
    },
  });
}

export function findOrderByIdDB(id: number, include?: Prisma.OrderInclude) {
  return prisma.order.findFirst({
    where: { id },
    include: {
      ...include,
    },
  });
}

export function createOrderDB(data: Order, include?: Prisma.OrderInclude) {
  const { items, ...rest } = data;
  return prisma.order.create({
    data: {
      ...rest,
      items: {
        connect: items.map((item) => ({ id: item.id })),
      },
    },
    include: {
      ...include,
    },
  });
}

export function updateOrderDB(
  id: number,
  data: Order,
  include?: Prisma.OrderInclude
) {
  const { items, ...rest } = data;
  return prisma.order.update({
    where: {
      id,
    },
    data: {
      ...rest,
      items: {
        connect: items.map((item) => ({ id: item.id })),
      },
    },
    include: {
      ...include,
    },
  });
}

export function deleteOrderDB(id: number, include?: Prisma.OrderInclude) {
  return prisma.order.delete({
    where: {
      id,
    },
    include: {
      ...include,
    },
  });
}
