import { randomUUID } from "crypto";
import prisma from "../../infrastructure/database/prisma/client";
import { Section } from "../../types/common";

export function getSectionsDB() {
  return prisma.section.findMany({
    include: {
      tables: true,
    },
  });
}

export function findSectionByIdDB(id: number) {
  return prisma.section.findFirst({
    where: {
      id,
    },
    include: {
      tables: true,
    },
  });
}

export function createSectionDB(data: Section) {
  const { tables, tableNumber, ...rest } = data;
  return prisma.$transaction(async (tx) => {
    return tx.section.create({
      data: {
        ...rest,
        tables: tableNumber
          ? {
              create: Array.from({ length: tableNumber }).map((table) => ({
                name: `${randomUUID()}-${table}`,
                status: "AVAILABLE",
              })),
            }
          : undefined,
      },
    });
  });
}

export function updateSectionDB(id: number, data: Section) {
  const { tables, ...rest } = data;
  return prisma.section.update({
    where: {
      id,
    },
    data: {
      ...rest,
      tables: {
        connect: tables?.map((table) => ({ id: table.id })),
      },
    },
    include: {
      tables: true,
    },
  });
}

export function deleteSectionDB(id: number) {
  return prisma.section.delete({
    where: {
      id,
    },
    include: {
      tables: true,
    },
  });
}
