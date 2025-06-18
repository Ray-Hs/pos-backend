import prisma from "../../infrastructure/database/prisma/client";
import { OrderItem } from "../../types/common";

export async function getOrderItemsDB() {
  return prisma.orderItem.findMany();
}

export async function getOrderItemByIdDB(id: number) {
  return prisma.orderItem.findFirst({
    where: {
      id,
    },
    include: {
      menuItem: true,
    },
  });
}

export async function createOrderItemDB(data: OrderItem) {
  return prisma.orderItem.create({
    data,
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

export async function deleteOrderItemDB(
  id: number,
  reason?: string,
  invoiceId?: number
) {
  return prisma.$transaction(async (tx) => {
    const deletedOrderItem = await tx.orderItem.delete({
      where: {
        id,
      },
    });
    if (!invoiceId) {
      throw new Error("No Invoice ID Provided.");
    }

    return tx.deletedOrderItem.create({
      data: {
        ...deletedOrderItem,
        reason: reason ?? "", // Provide an appropriate reason or pass as a parameter
        invoiceId, // Set to a valid invoiceId or null if allowed
      },
    });
  });
}
