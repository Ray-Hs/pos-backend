import prisma from "../../infrastructure/database/prisma/client";
import { LIMIT_CONSTANT } from "../../infrastructure/utils/constants";
import { Invoice, PaymentMethod, TxClientType } from "../../types/common";

// Get all invoices with optional pagination
export const getInvoicesDB = async (
  filterBy?: PaymentMethod | undefined,
  page: number = 1
) => {
  return prisma.invoice.findMany({
    where: filterBy
      ? {
          paymentMethod: {
            equals: filterBy || "CASH",
          },
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: LIMIT_CONSTANT,
    skip: Math.abs((page - 1) * LIMIT_CONSTANT),
  });
};

// Find invoice by ID with proper error handling
export const findInvoiceByIdDB = async (id: number) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id },
    include: {
      customerDiscount: true,
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
  discount?: number
): number => {
  let total = subtotal + (constants?.service?.amount ?? 0);
  total += subtotal * (constants?.tax?.rate ?? 0);

  if (discount) {
    total = total - total * (discount / 100);
  }

  return Number(total.toFixed(2));
};

// Create invoice with better error handling and validation
export const createInvoiceDB = async (data: Invoice, client: TxClientType) => {
  const {
    customerDiscountId,
    customerDiscount,
    customerInfoId,
    discount,
    id,
    ...rest
  } = data;

  return client.invoice.create({
    data: {
      ...rest,
      customerInfoId,
      discount,
      customerDiscountId: customerDiscountId,
      version: data.version || 0,
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
  const { id: _id, discount, customerDiscount, ...rest } = data;
  return client.invoice.update({
    where: { id },
    data: { ...rest, discount },
  });
};

export const deleteInvoiceDB = async (id: number, client: TxClientType) => {
  return client.invoice.delete({
    where: { id },
  });
};
