import prisma from "../../infrastructure/database/prisma/client";
import { Invoice } from "../../types/common";
import { getConstantsDB } from "../constants/constants.repository";
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
export const createInvoiceDB = async (data: Invoice) => {
  const { serviceId, discount, tableId, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const invoiceRef = await tx.invoiceRef.findFirst({
      where: {
        id: data.invoiceRefId,
      },
    });
    if (!invoiceRef) {
      throw new Error("No Invoice Ref Found");
    }
    const order = await tx.order.findFirst({
      where: { id: invoiceRef?.orderId ?? undefined },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order with ID ${invoiceRef?.orderId} not found`);
    }

    const constants = await getConstantsDB();

    const subtotal = order.items.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );

    const total = calculateTotal(
      subtotal,
      constants,
      discount as CustomerDiscount
    );

    const invoice = await tx.invoice.create({
      data: {
        ...rest,
        tableId,
        subtotal,
        total,
        userId: data.userId as number,
        taxId: constants.tax?.id,
        serviceId: constants.service?.id,
        invoiceRefId: invoiceRef?.id,
        version: 1,
        customerDiscountId: discount?.id,
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
              id: invoiceRef.orderId ?? undefined,
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
    const { id: _id, discount, ...rest } = data;
    const invoice = await findInvoiceByIdDB(id);
    const invoiceRef = await tx.invoiceRef.findFirst({
      where: {
        id: data.invoiceRefId,
      },
    });
    const order = await tx.order.findFirst({
      where: { id: invoiceRef?.orderId ?? undefined },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order with ID ${invoiceRef?.orderId} not found`);
    }

    const constants = await getConstantsDB();
    const subtotal = order.items.reduce(
      (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
      0
    );

    const total = calculateTotal(
      subtotal,
      constants,
      data.discount ?? (invoice?.discount as CustomerDiscount)
    );

    return tx.invoice.update({
      where: { id },
      data: {
        ...rest,
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
