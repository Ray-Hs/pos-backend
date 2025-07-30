import prisma from "../../infrastructure/database/prisma/client";
import { LIMIT_CONSTANT } from "../../infrastructure/utils/constants";
import loggerWithHelpers from "../../infrastructure/utils/logger";
import { Invoice, PaymentMethod, TxClientType } from "../../types/common";

// Get all invoices with optional pagination
export const getInvoicesDB = async (filterBy?: PaymentMethod | undefined) => {
  return prisma.invoice.findMany({
    where: filterBy
      ? {
          paymentMethod: {
            equals: filterBy || "CASH",
          },
        }
      : {},
    orderBy: { createdAt: "desc" },
  });
};

export const getFinanceInvoicesDB = async (
  q?: string,
  page?: number,
  limit?: number
) => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let invoiceRef;
  if (q) {
    invoiceRef = {
      id: parseInt(q as string),
    };
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      invoiceRef,
      isLatestVersion: true,
      paid: true,
      createdAt: {
        gte: yesterday,
        lte: now,
      },
    },
    take: LIMIT_CONSTANT,
    include: {
      table: {
        select: {
          name: true,
          id: true,
        },
      },
      tax: true,
      service: true,
      invoiceRef: {
        include: {
          invoices: {
            select: {
              id: true,
            },
          },
          Order: {
            select: {
              createdAt: true,
              id: true,
              items: {
                select: {
                  id: true,
                  price: true,
                  quantity: true,
                  createdAt: true,
                  notes: true,
                  menuItem: {
                    select: {
                      id: true,
                      title_ar: true,
                      title_en: true,
                      title_ku: true,
                      image: true,
                      subCategoryId: true,
                      discount: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  id: true,
                  username: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group items by menuItem title for each invoice and calculate totals
  return invoices.map((invoice) => {
    if (invoice.invoiceRef?.Order?.items) {
      const items = invoice.invoiceRef.Order.items;

      return {
        ...invoice,
        invoiceRef: {
          ...invoice.invoiceRef,
          Order: {
            ...invoice.invoiceRef.Order,
            items: items,
          },
        },
      };
    }

    return invoice;
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

// Helper function to calculate subtotal from order items
// This function sums up the total price of all items (price * quantity)
export const calculateSubtotal = (orderItems: any[]): number => {
  return orderItems.reduce(
    (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
    0
  );
};

// Helper function to calculate total with tax and service
// Formula: Total = Subtotal + Service Charge + Tax + Discount
// - Service charge is a fixed amount added to subtotal
// - Tax is calculated as a percentage of subtotal
// - Discount is applied as a percentage of the total (after tax and service)
export const calculateTotal = (
  subtotal: number,
  constants: {
    tax?: { rate: number } | null;
    service?: { amount: number } | null;
  },
  discount?: number
): number => {
  let total = subtotal;

  // Apply discount (percentage of total)
  if (discount && discount > 0) {
    total = total - total * (discount / 100);
  }
  // Add tax (percentage of subtotal)
  if (constants?.tax?.rate) {
    total += total * constants.tax.rate;
  }
  // Add service charge (fixed amount)
  if (constants?.service?.amount) {
    total += constants.service.amount;
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
  const { id: _id, discount, customerDiscount, paymentMethod, ...rest } = data;
  return client.invoice.update({
    where: { id },
    data: { ...rest, discount, paymentMethod },
  });
};

export const deleteInvoiceDB = async (id: number, client: TxClientType) => {
  return client.invoice.delete({
    where: { id },
  });
};

// Group order items by similar products and increase quantity
export const groupOrderItemsDB = async (orderId: number) => {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      menuItem: {
        select: {
          id: true,
          title_en: true,
          title_ku: true,
          title_ar: true,
          price: true,
        },
      },
    },
  });

  // Group items by menuItemId
  const groupedItems = new Map<
    number,
    {
      menuItemId: number;
      menuItem: any;
      totalQuantity: number;
      totalPrice: number;
      notes: string[];
      originalItems: any[];
    }
  >();

  for (const item of orderItems) {
    const key = item.menuItemId;

    if (!groupedItems.has(key)) {
      groupedItems.set(key, {
        menuItemId: item.menuItemId,
        menuItem: item.menuItem,
        totalQuantity: 0,
        totalPrice: 0,
        notes: [],
        originalItems: [],
      });
    }

    const group = groupedItems.get(key)!;
    group.totalQuantity += item.quantity;
    group.totalPrice += item.price * item.quantity;
    if (item.notes) {
      group.notes.push(item.notes);
    }
    group.originalItems.push(item);
  }

  // Convert to array and sort by menuItem title
  const groupedArray = Array.from(groupedItems.values()).sort((a, b) =>
    a.menuItem.title_en.localeCompare(b.menuItem.title_en)
  );

  return groupedArray;
};

// Test function to demonstrate invoice calculation
export const testInvoiceCalculation = () => {
  // Example order items
  const orderItems = [
    { price: 10.0, quantity: 2 }, // $20.00
    { price: 15.5, quantity: 1 }, // $15.50
    { price: 8.0, quantity: 3 }, // $24.00
  ];

  // Example constants
  const constants = {
    tax: { rate: 10 }, // 10% tax
    service: { amount: 5.0 }, // $5.00 service charge
  };

  // Calculate subtotal
  const subtotal = calculateSubtotal(orderItems);
  console.log("Subtotal:", subtotal); // Should be $59.50

  // Calculate total with tax and service
  const total = calculateTotal(subtotal, constants);
  console.log("Total (with tax and service):", total); // Should be $70.45

  // Calculate total with discount
  const totalWithDiscount = calculateTotal(subtotal, constants, 15); // 15% discount
  console.log("Total (with 15% discount):", totalWithDiscount); // Should be $59.88

  return { subtotal, total, totalWithDiscount };
};
