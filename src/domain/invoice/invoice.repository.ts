import prisma from "../../infrastructure/database/prisma/client";
import logger from "../../infrastructure/utils/logger";
import { Invoice } from "../../types/common";
import { getConstantsDB } from "../constants/constants.repository";

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
      order: true,
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
const calculateTotal = (
  subtotal: number,
  constants: any,
  discount?: number
): number => {
  let total = subtotal + (constants?.service?.amount ?? 0);
  total += subtotal * (constants?.tax?.rate ?? 0);

  if (discount) {
    total = total * (1 - discount);
  }

  return Number(total.toFixed(2));
};

// Create invoice with better error handling and validation
export const createInvoiceDB = async (data: Invoice) => {
  const { serviceId, orderId, discount, tableId, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const constants = await getConstantsDB();

    const subtotal = order.items.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );

    const total = calculateTotal(subtotal, constants, discount);

    const invoice = await tx.invoice.create({
      data: {
        ...rest,
        orderId,
        tableId,
        subtotal,
        total,
        userId: data.userId as number,
        taxId: constants.tax?.id,
        serviceId: constants.service?.id,
        discount: discount || 0,
      },
    });

    if (tableId) {
      console.log("Invoice Table ID: ", tableId);
      await tx.table.update({
        where: {
          id: tableId || undefined,
        },
        data: {
          status: "AVAILABLE",
          orders: {
            disconnect: {
              id: orderId,
            },
          },
        },
      });
    }

    return invoice;
  });
};

// Update invoice with validation and recalculation
export const updateInvoiceDB = async (id: number, data: Partial<Invoice>) => {
  return prisma.$transaction(async (tx) => {
    const invoice = await findInvoiceByIdDB(id);
    const order = await tx.order.findFirst({
      where: { id: invoice.orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order with ID ${invoice.orderId} not found`);
    }

    const constants = await getConstantsDB();
    const subtotal = order.items.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );

    const total = calculateTotal(
      subtotal,
      constants,
      data.discount ?? invoice.discount
    );

    return tx.invoice.update({
      where: { id },
      data: {
        ...data,
        subtotal,
        total,
      },
    });
  });
};

// Delete invoice with validation
export const deleteInvoiceDB = async (id: number) => {
  const exists = await findInvoiceByIdDB(id);

  if (!exists) {
    throw new Error(`Invoice with ID ${id} not found`);
  }

  return prisma.invoice.delete({
    where: { id },
  });
};
