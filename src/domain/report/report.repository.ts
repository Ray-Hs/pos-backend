// src/services/report/report.repository.ts

import { DeletedOrderItem, Prisma, PrismaClient } from "@prisma/client";
import { Supply } from "../supply/supply.types";

interface EmployeeSalesRow {
  employeeId: number;
  employeeName: string;
  code: string;
  productName: string; // Add this field
  companyName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  orders?: number;
}

/**
 * Get all supplies between `from` and `to` (inclusive),
 * including their company, for the “close day” report.
 */
export async function getCloseDayDB(
  prisma: PrismaClient,
  from?: Date,
  to?: Date,
  company?: string
): Promise<Supply[]> {
  const where: Prisma.supplyWhereInput = {};
  where.createdAt = {};
  if (from) where.createdAt.gte = from;
  if (to) where.createdAt.lte = to;

  if (company) {
    where.company = {
      name: {
        equals: company,
        mode: "insensitive",
      },
    };
  }

  return prisma.supply.findMany({
    where,
    include: { company: true },
  });
}

// Modified getEmployeeSalesDB function to return individual items per employee
export async function getEmployeeSalesDB(
  prisma: PrismaClient,
  from?: Date,
  to?: Date,
  employee?: string
): Promise<EmployeeSalesRow[]> {
  // Build optional date filter
  const where: Prisma.OrderWhereInput = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  // Add employee filter if specified
  if (employee) {
    where.user = {
      username: employee,
    };
  }

  // Get all orders with their items and user info
  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      items: {
        select: {
          menuItemId: true,
          price: true,
          quantity: true,
          menuItem: {
            select: {
              code: true,
              title_en: true, // Add product name
              price: true,
            },
          },
        },
      },
    },
  });

  // Create individual rows for each menu item per employee
  const results: EmployeeSalesRow[] = [];

  orders.forEach((order) => {
    const userId = order.userId;
    const userName = order.user.username;
    const ordersHandled = orders.filter(
      (orderValue) => order.userId === orderValue.userId
    ).length;

    order.items.forEach((item) => {
      results.push({
        employeeId: userId,
        employeeName: userName,
        code: item.menuItem.code ?? "",
        productName: item.menuItem.title_en ?? "", // Add product name
        companyName: "", // You might want to add company info from somewhere
        quantity: item.quantity,
        unitPrice: item.menuItem.price,
        costPrice: item.price || 0,
        orders: ordersHandled,
      });
    });
  });

  return results;
}

/**
 * Fetch all deleted order items between `from` and `to` grouped by order ID.
 */
export async function getDeletedItemsDB(
  prisma: PrismaClient,
  from?: Date,
  to?: Date
) {
  const where: Prisma.DeletedOrderItemWhereInput = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  // Fetch all deleted order items matching the filter
  const deletedItems = await prisma.deletedOrderItem.findMany({
    select: {
      order: true,
      orderId: true,
      menuItem: {
        select: {
          title_en: true,
          title_ku: true,
          title_ar: true,
        },
      },
      reason: true,
      price: true,
      quantity: true,
    },
    where,
  });

  // Group by orderId
  const grouped: Record<string, { items: any[]; order: any }> = {};
  for (const item of deletedItems) {
    const key = item.orderId?.toString() || "unknown";
    if (!grouped[key]) {
      grouped[key] = { items: [], order: item.order };
    }
    grouped[key].items.push(item);
  }

  // Return grouped data as array of objects with orderId, order details, and items
  return Object.entries(grouped).map(([orderId, data]) => ({
    orderId: parseInt(orderId) || 0,
    order: data.order,
    items: data.items,
  }));
}
