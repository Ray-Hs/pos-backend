import prisma from "../../infrastructure/database/prisma/client";
import { Invoice, TxClientType } from "../../types/common";
import { CustomerDiscount } from "../settings/crm/crm.types";

// Get all invoices with optional pagination
export const getInvoicesDB = async () => {
  return prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// Find invoice by ID with proper error handling
export const findInvoiceByIdDB = async (id: number) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id },
    include: {
      discount: true,
      tax: true,
      service: true,
    },
  });

  if (!invoice) {
    throw new Error(`Invoice with ID ${id} not found`);
  }

  return invoice;
};

// Helper function to calculate total
export const calculateTotal = (
  subtotal: number,
  constants: any,
  discount?: CustomerDiscount
): number => {
  let total = subtotal + (constants?.service?.amount ?? 0);
  total += subtotal * (constants?.tax?.rate ?? 0);

  if (discount) {
    total = total * (1 - discount.discount);
  }

  return Number(total.toFixed(2));
};

// Create invoice with better error handling and validation
export const createInvoiceDB = async (data: Invoice, client: TxClientType) => {
  const { discount, id, ...rest } = data;

  return client.invoice.create({
    data: {
      ...rest,
      customerDiscountId: discount?.id,
      version: data.version,
      invoiceRefId: data.invoiceRefId || 0,
      total: data.total || 0,
      subtotal: data.subtotal || 0,
      userId: data.userId || 0,
    },
  });
};

// Update invoice with validation and recalculation
export const updateInvoiceDB = async (
  id: number,
  data: Partial<Invoice>,
  client: TxClientType
) => {
  const { id: _id, discount, ...rest } = data;
  return client.invoice.update({
    where: { id },
    data: { ...rest },
  });
};

export const deleteInvoiceDB = async (id: number, client: TxClientType) => {
  return client.invoice.delete({
    where: { id },
  });
};
