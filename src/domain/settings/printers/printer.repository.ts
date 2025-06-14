import prisma from "../../../infrastructure/database/prisma/client";
import { Printer } from "./printer.types";

export async function getPrintersDB() {
  return prisma.printers.findMany();
}

export async function getPrinterByNameDB(name: string) {
  return prisma.printers.findFirst({
    where: {
      name,
    },
  });
}

export async function getPrinterByIdDB(id: number) {
  return prisma.printers.findFirst({
    where: {
      id,
    },
  });
}

export async function createPrinterDB(data: Printer) {
  const { id, ...rest } = data;
  return prisma.$transaction(async (tx) => {
    const isSettingsAvailable = await tx.settings.findFirst();
    if (!isSettingsAvailable) {
      const newSettings = await tx.settings.create({ data: {} });
      return tx.printers.create({
        data: { ...rest, settingsId: newSettings.id },
      });
    }

    return tx.printers.create({
      data: { ...rest, settingsId: isSettingsAvailable.id },
    });
  });
}

export async function updatePrinterDB(data: Printer, id: number) {
  return prisma.printers.update({ where: { id }, data });
}

export async function deletePrinterDB(id: number) {
  return prisma.printers.delete({ where: { id } });
}
