import { Prisma } from "@prisma/client";
import prisma from "../../infrastructure/database/prisma/client";
import { SubCategory } from "../../types/common";

export function getSubcategoriesDB() {
  return prisma.subCategory.findMany({
    include: {
      _count: true,
    },
  });
}

export function getSubcategoriesByCategoryIdDB(
  id: number,
  include?: Prisma.SubCategoryInclude
) {
  return prisma.subCategory.findMany({
    where: {
      categoryId: id,
    },
    include: {
      ...include,
    },
  });
}

export function findSubcategoryByIdDB(
  id: number,
  include?: Prisma.SubCategoryInclude
) {
  return prisma.subCategory.findFirst({
    where: {
      id,
    },
    include: {
      ...include,
    },
  });
}

export function createSubcategoryDB(
  data: SubCategory,
  include?: Prisma.SubCategoryInclude
) {
  const { items, ...rest } = data;
  return prisma.subCategory.create({
    data: {
      ...rest,
    },
    include: {
      ...include,
    },
  });
}

export function updateSubcategoryDB(
  id: number,
  data: SubCategory,
  include?: Prisma.SubCategoryInclude
) {
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
    include: {
      ...include,
    },
  });
}

export function deleteSubcategoryDB(
  id: number,
  include?: Prisma.SubCategoryInclude
) {
  return prisma.subCategory.delete({
    where: {
      id,
    },
    include: {
      ...include,
    },
  });
}
