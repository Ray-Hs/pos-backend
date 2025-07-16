// src/services/report/report.repository.ts

import { DeletedOrderItem, Prisma, PrismaClient } from "@prisma/client";
import { Supply } from "../supply/supply.types";

export interface EmployeeSalesRow {
  employeeId: number;
  product: string;
  employeeName: string;
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
  to?: Date
): Promise<Supply[]> {
  const where: Prisma.supplyWhereInput = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
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
  to?: Date
): Promise<EmployeeSalesRow[]> {
  // Build optional date filter
  const where: Prisma.OrderItemWhereInput = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  // 1) group by employeeId, menuItemId, price & costPrice
  const groups = await prisma.orderItem.groupBy({
    by: ["id", "menuItemId", "price"],
    _sum: { quantity: true },
    where,
  });

  // 2) batch‐load all involved users and menu items
  const employeeIds = Array.from(new Set(groups.map((g) => g.id)));
  const menuItemIds = Array.from(new Set(groups.map((g) => g.menuItemId)));

  const users = await prisma.user.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, username: true },
  });
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, title_en: true, price: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u.username]));
  const menuItemMap = new Map(menuItems.map((m) => [m.id, m.title_en]));

  // 3) stitch everything together
  return groups.map((g) => {
    const menuItem = menuItems.find((item) => item.id === g.menuItemId);

    return {
      employeeId: g.id,
      product: menuItemMap.get(g.menuItemId) ?? "",
      employeeName: userMap.get(g.id) ?? "",
      quantity: g._sum?.quantity ?? 0,
      unitPrice: g.price,
      costPrice: menuItem?.price || 0,
    };
  });
}

/**
 * Fetch all deleted order items between `from` and `to`.
 */
export async function getDeletedItemsDB(
  prisma: PrismaClient,
  from?: Date,
  to?: Date
): Promise<DeletedOrderItem[]> {
  const where: Prisma.DeletedOrderItemWhereInput = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  return prisma.deletedOrderItem.findMany({ where });
}
