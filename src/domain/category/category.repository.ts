// Category Repository

import { Prisma } from "@prisma/client";
import prisma from "../../infrastructure/database/prisma/client";
import { Category, Filter } from "../../types/common";

export async function findCategoryDB(
  id: number,
  include?: Prisma.CategoryInclude
) {
  return prisma.category.findFirst({
    where: {
      id,
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
      ...include,
    },
  });
}

export async function getCategoriesDB(
  include?: Prisma.CategoryInclude,
  filter?: Filter
) {
  return prisma.category.findMany({
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
      ...include,
    },
    orderBy: {
      sortOrder: filter,
    },
  });
}

export async function updateCategoryDB(
  id: number,
  data: Category,
  include?: Prisma.CategoryInclude
) {
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
      ...include,
    },
  });
}

export async function createCategoryDB(
  data: Category,
  include?: Prisma.CategoryInclude
) {
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
    include: {
      ...include,
    },
  });
}

export async function deleteCategoryDB(
  id: number,
  include?: Prisma.CategoryInclude
) {
  return prisma.category.delete({
    where: {
      id,
    },
    include: {
      ...include,
    },
  });
}
