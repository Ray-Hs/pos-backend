import prisma from "../../infrastructure/database/prisma/client";
import { Invoice } from "../../types/common";

export async function getInvoicesDB() {
  return prisma.invoice.findMany();
}

export async function findInvoiceByIdDB(id: number) {
  return prisma.invoice.findFirst({
    where: {
      id,
    },
  });
}

export async function createInvoiceDB(data: Invoice) {
  return prisma.invoice.create({
    data,
  });
}

export async function updateInvoiceDB(id: number, data: Invoice) {
  return prisma.invoice.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteInvoiceDB(id: number) {
  return prisma.invoice.delete({
    where: {
      id,
    },
  });
}
