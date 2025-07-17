// src/services/report/report.repository.ts

import { DeletedOrderItem, Prisma, PrismaClient } from "@prisma/client";
import { Supply } from "../supply/supply.types";

export interface EmployeeSalesRow {
  employeeId: number;
  employeeName: string;
  code: string;
  companyName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
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

/**
 * Aggregate total sales per employee using Prisma.groupBy,
 * then enrich with User.name and MenuItem.name.
 */
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

  // 1) Get all orders with their items and user info
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
              price: true,
            },
          },
        },
      },
    },
  });

  // 2) Group orders by userId and calculate totals
  const employeeStats = new Map<
    string,
    {
      employeeId: number;
      employeeName: string;
      code: string;
      companyName: string;
      totalQuantity: number;
      totalRevenue: number;
      totalCost: number;
    }
  >();

  orders.forEach((order) => {
    const userId = order.userId;
    const userName = order.user.username;
    const item = order.items[0];
    const code = item.menuItem.code ?? "";
    if (!employeeStats.has(userId.toString())) {
      employeeStats.set(userId.toString(), {
        employeeId: userId,
        employeeName: userName,
        code,
        companyName: "",
        totalQuantity: 0,
        totalRevenue: 0,
        totalCost: 0,
      });
    }

    const stats = employeeStats.get(userId.toString())!;

    order.items.forEach((item) => {
      stats.totalQuantity += item.quantity;
      stats.totalRevenue += item.menuItem.price * item.quantity;
      stats.totalCost += (item.price || 0) * item.quantity;
    });
  });

  // 3) Convert to the expected format
  return Array.from(employeeStats.values()).map((stats) => ({
    employeeId: stats.employeeId,
    employeeName: stats.employeeName,
    code: stats.code,
    companyName: stats.companyName,
    quantity: stats.totalQuantity,
    unitPrice:
      stats.totalQuantity > 0 ? stats.totalRevenue / stats.totalQuantity : 0,
    costPrice:
      stats.totalQuantity > 0 ? stats.totalCost / stats.totalQuantity : 0,
  }));
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
      menuItemId: true,
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
