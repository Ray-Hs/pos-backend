// Category Repository

import prisma from "../../infrastructure/database/prisma/client";
import { Category } from "../../types/common";

export async function findCategoryDB(id: number) {
  return prisma.category.findFirst({
    where: {
      id,
    },
  });
}

export async function getCategoriesDB() {
  return prisma.category.findMany();
}

export async function updateCategory(id: number, data: Category) {
  return prisma.category.update({
    where: { id },
    data: {
      title_ar: data.title_ar,
      title_en: data.title_en,
      title_ku: data.title_ku,
      description_ar: data.description_ar,
      description_en: data.description_en,
      description_ku: data.description_ku,
      image: data.image,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
    include: {
      subCategory: true,
    },
  });
}
