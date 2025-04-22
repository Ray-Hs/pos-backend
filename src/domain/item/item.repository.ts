import prisma from "../../infrastructure/database/prisma/client";
import { MenuItem } from "../../types/common";

export async function getItemsDB() {
  return prisma.menuItem.findMany();
}

export async function findItemByIdDB(id: number) {
  return prisma.menuItem.findFirst({
    where: {
      id,
    },
  });
}

export async function findItemBySubCategoryIdDB(id: number) {
  return prisma.menuItem.findMany({
    where: {
      subCategoryId: id,
    },
  });
}

export async function createItemDB(data: MenuItem) {
  return prisma.menuItem.create({
    data,
  });
}

export async function updateItemDB(id: number, data: MenuItem) {
  return prisma.menuItem.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteItemDB(id: number) {
  return prisma.menuItem.delete({
    where: {
      id,
    },
  });
}
