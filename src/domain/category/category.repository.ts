// Category Repository

import prisma from "../../infrastructure/database/prisma/client";
import { Category } from "../../types/common";

export async function findCategoryDB(id: number) {
  return prisma.category.findFirst({
    where: {
      id,
    },
    include: {
      _count: true,
    },
  });
}

export async function getCategoriesDB() {
  return prisma.category.findMany({
    include: {
      _count: true,
    },
  });
}

export async function updateCategoryDB(id: number, data: Category) {
  const subCategory = data?.subCategory;
  return prisma.category.update({
    where: { id },
    data: {
      ...data,
      subCategory: {
        connect: subCategory?.map((sub) => ({
          id: sub.id,
        })),
      },
    },
    include: {
      _count: true,
    },
  });
}

export async function createCategoryDB(data: Category) {
  const subCategory = data?.subCategory;
  return prisma.category.create({
    data: {
      ...data,
      subCategory: {
        connect: subCategory?.map((sub) => ({
          id: sub.id,
        })),
      },
    },
    include: {
      _count: true,
    },
  });
}

export async function deleteCategoryDB(id: number) {
  return prisma.category.delete({
    where: {
      id,
    },
    include: {
      _count: true,
    },
  });
}
