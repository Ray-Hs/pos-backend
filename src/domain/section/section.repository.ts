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
  const tables = data?.tables;
  return prisma.section.create({
    data: {
      ...data,
      tables: {
        connect: tables?.map((table) => ({ id: table.id })),
      },
    },
    include: {
      tables: true,
    },
  });
}

export function updateSectionDB(id: number, data: Section) {
  const tables = data?.tables;
  return prisma.section.update({
    where: {
      id,
    },
    data: {
      ...data,
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
