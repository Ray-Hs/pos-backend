import { Prisma } from "@prisma/client";
import prisma from "../../infrastructure/database/prisma/client";
import { Filter, FilterBy, Language, MenuItem } from "../../types/common";

export async function getItemsDB(filter?: {
  q?: string;
  subcategoryId?: number;
  sort?: Filter;
  sortby?: FilterBy;
  language?: Language;
}) {
  const orderByField =
    filter?.sortby === "name"
      ? filter?.language === "ku"
        ? "title_ku"
        : filter?.language === "ar"
        ? "title_ar"
        : "title_en"
      : filter?.sortby === "date"
      ? "createdAt"
      : filter?.sortby === "price"
      ? "price"
      : "id";

  let whereClause = [];

  if (filter?.q) {
    whereClause.push({
      OR: [
        {
          title_ar: {
            contains: filter?.q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          title_en: {
            contains: filter?.q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          title_ku: {
            contains: filter?.q,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    });
  }
  if (filter?.subcategoryId) {
    whereClause.push({
      subCategoryId: filter?.subcategoryId,
    });
  }

  return prisma.menuItem.findMany({
    include: {
      SubCategory: {
        select: {
          Category: {
            select: {
              title_ar: true,
              title_ku: true,
              title_en: true,
              id: true,
            },
          },
          title_ar: true,
          title_ku: true,
          title_en: true,
        },
      },
    },
    orderBy: {
      [orderByField]: filter?.sort || "asc",
    },
    where: {
      AND: [...whereClause],
    },
  });
}

export async function findItemByIdDB(
  id: number,
  include?: Prisma.MenuItemInclude
) {
  return prisma.menuItem.findFirst({
    where: {
      id,
    },
    include,
  });
}

export async function findItemBySubCategoryIdDB(
  id: number,
  include?: Prisma.MenuItemInclude
) {
  return prisma.menuItem.findMany({
    where: {
      subCategoryId: id,
    },
    include,
  });
}

export async function createItemDB(
  data: MenuItem,
  include?: Prisma.MenuItemInclude
) {
  return prisma.menuItem.create({
    data,
    include,
  });
}

export async function updateItemDB(
  id: number,
  data: MenuItem,
  include?: Prisma.MenuItemInclude
) {
  return prisma.menuItem.update({
    where: {
      id,
    },
    data,
    include,
  });
}

export async function deleteItemDB(
  id: number,
  include?: Prisma.MenuItemInclude
) {
  return prisma.menuItem.delete({
    where: {
      id,
    },
    include,
  });
}
