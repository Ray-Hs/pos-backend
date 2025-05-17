import prisma from "../../infrastructure/database/prisma/client";
import { Filter, SubCategory } from "../../types/common";

export function getSubcategoriesDB(filter?: Filter) {
  return prisma.subCategory.findMany({
    include: {
      _count: true,
      items: {
        select: {
          _count: true,
        },
      },
      Category: true,
    },
    orderBy: [{ sortOrder: filter }, { id: filter }],
  });
}

export function getSubcategoriesByCategoryIdDB(id: number, filter?: Filter) {
  return prisma.subCategory.findMany({
    where: {
      categoryId: id,
    },
    include: {
      _count: true,
      items: {
        select: {
          _count: true,
        },
      },
    },
    orderBy: [{ sortOrder: filter }, { id: filter }],
  });
}

export function findSubcategoryByIdDB(id: number) {
  return prisma.subCategory.findFirst({
    where: {
      id,
    },
    include: {
      _count: true,
      items: {
        select: {
          _count: true,
        },
      },
    },
  });
}

export function createSubcategoryDB(data: SubCategory) {
  const { items, ...rest } = data;
  return prisma.subCategory.create({
    data: {
      ...rest,
    },
  });
}

export function updateSubcategoryDB(id: number, data: SubCategory) {
  const { items, ...rest } = data;
  return prisma.subCategory.update({
    where: {
      id,
    },
    data: {
      ...rest,
      items: {
        connect: items?.map((item) => ({ id: item.id })),
      },
    },
  });
}

export function deleteSubcategoryDB(id: number) {
  return prisma.subCategory.delete({
    where: {
      id,
    },
  });
}
