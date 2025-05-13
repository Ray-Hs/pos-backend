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
  const { tables, tableCount, ...rest } = data;
  return prisma.$transaction(async (tx) => {
    return tx.section.create({
      data: {
        ...rest,
        tables: tableCount
          ? {
              create: Array.from({ length: tableCount }).map((_, i) => ({
                name: `${randomUUID().slice(0, 6)}-${i}`,
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
