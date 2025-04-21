import prisma from "../../infrastructure/database/prisma/client";
import { SubCategory } from "../../types/common";

export function getSubcategoriesDB() {
  return prisma.subCategory.findMany({
    include: {
      _count: true,
    },
  });
}

export function findSubcategoryByIdDB(id: number) {
  return prisma.subCategory.findFirst({
    where: {
      id,
    },
    include: {
      _count: true,
    },
  });
}

export function createSubcategoryDB(data: SubCategory) {
  const items = data?.items;

  return prisma.subCategory.create({
    data: {
      ...data,
      items: {
        connect: items?.map((item) => ({ id: item.id })),
      },
    },
    include: {
      _count: true,
    },
  });
}

export function updateSubcategoryDB(id: number, data: SubCategory) {
  const items = data?.items;
  return prisma.subCategory.update({
    where: {
      id,
    },
    data: {
      ...data,
      items: {
        connect: items?.map((item) => ({ id: item.id })),
      },
    },
    include: {
      _count: true,
    },
  });
}

export function deleteSubcategoryDB(id: number) {
  return prisma.subCategory.delete({
    where: {
      id,
    },
    include: {
      _count: true,
    },
  });
}
