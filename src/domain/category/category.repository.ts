// Category Repository

import prisma from "../../infrastructure/database/prisma/client";
import { Category, Filter } from "../../types/common";

export async function findCategoryDB(id: number) {
  return prisma.category.findFirst({
    where: {
      id,
    },
    include: {
      _count: true,
      subCategory: {
        include: {
          _count: true,
        },
      },
    },
  });
}

export async function getCategoriesDB(filter?: Filter) {
  return prisma.category.findMany({
    include: {
      _count: true,
      subCategory: {
        include: {
          _count: true,
        },
      },
    },
    orderBy: {
      sortOrder: filter,
    },
  });
}

export async function updateCategoryDB(id: number, data: Category) {
  const { subCategory, ...rest } = data;
  return prisma.category.update({
    where: { id },
    data: {
      ...rest,
      subCategory: {
        connect: subCategory?.map((sub) => ({
          id: sub.id,
        })),
      },
    },
    include: {
      subCategory: {
        include: {
          items: {
            include: {
              _count: true,
            },
          },
        },
      },
    },
  });
}

export async function createCategoryDB(data: Category) {
  const { subCategory, ...rest } = data;
  return prisma.category.create({
    data: {
      ...rest,
      subCategory: {
        connect: subCategory?.map((sub) => ({
          id: sub.id,
        })),
      },
    },
  });
}

export async function deleteCategoryDB(id: number) {
  return prisma.category.delete({
    where: {
      id,
    },
  });
}
