import { Prisma } from "@prisma/client";
import prisma from "../../infrastructure/database/prisma/client";
import { Filter, FilterBy, Language, MenuItem } from "../../types/common";

export async function getItemsDB(
  include?: Prisma.MenuItemInclude,
  filter?: {
    subcategoryId?: number;
    sort?: Filter;
    sortby?: FilterBy;
    language?: Language;
  }
) {
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

  return prisma.menuItem.findMany({
    include,
    where: filter?.subcategoryId
      ? { subCategoryId: filter.subcategoryId }
      : undefined,
    orderBy: {
      [orderByField]: filter?.sort || "asc",
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
