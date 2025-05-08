import prisma from "../../infrastructure/database/prisma/client";
import { OrderItem } from "../../types/common";

export async function createOrderItemDB(data: OrderItem) {
  return prisma.orderItem.create({
    data,
  });
}

export async function getOrderItemsDB() {
  return prisma.orderItem.findMany();
}

export async function getOrderItemByIdDB(id: number) {
  return prisma.orderItem.findFirst({
    where: {
      id,
    },
  });
}

export async function updateOrderItemDB(id: number, data: OrderItem) {
  return prisma.orderItem.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteOrderItemDB(id: number) {
  return prisma.orderItem.delete({
    where: {
      id,
    },
  });
}
