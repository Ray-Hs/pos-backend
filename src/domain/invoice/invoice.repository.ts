import prisma from "../../infrastructure/database/prisma/client";
import { calculateSkip, Take } from "../../infrastructure/utils/calculateSkip";
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

export const getFinanceInvoicesDB = async () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const invoices = await prisma.invoice.findMany({
    where: {
      isLatestVersion: true,
      paid: true,
      createdAt: {
        gte: yesterday,
        lte: now,
      },
    },
    skip: calculateSkip(),
    take: Take(),
    include: {
      table: {
        select: {
          name: true,
          id: true,
        },
      },
      invoiceRef: {
        include: {
          Order: {
            select: {
              createdAt: true,
              id: true,
              items: {
                select: {
                  price: true,
                  quantity: true,
                  menuItem: {
                    select: {
                      title_ar: true,
                      title_en: true,
                      title_ku: true,
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

  // Group items by menuItem title for each invoice
  return invoices.map((invoice) => {
    if (invoice.invoiceRef?.Order?.items) {
      const items = invoice.invoiceRef.Order.items;
      const groupedItems = new Map<
        string,
        {
          price: number;
          quantity: number;
          menuItem: any;
        }
      >();

      // Group items by menuItem title_en
      for (const item of items) {
        const key = item.menuItem.title_en;

        if (!groupedItems.has(key)) {
          groupedItems.set(key, {
            price: item.price,
            quantity: 0,
            menuItem: item.menuItem,
          });
        }

        const group = groupedItems.get(key)!;
        group.quantity += item.quantity;
      }

      // Convert grouped items back to array
      const groupedItemsArray = Array.from(groupedItems.values());

      return {
        ...invoice,
        invoiceRef: {
          ...invoice.invoiceRef,
          Order: {
            ...invoice.invoiceRef.Order,
            items: groupedItemsArray,
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
