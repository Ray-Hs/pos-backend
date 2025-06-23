import prisma from "../../infrastructure/database/prisma/client";
import { createCompanyInfoDB } from "../settings/crm/crm.repository";
import { CompanyInfo } from "../settings/crm/crm.types";
import { Supply } from "./supply.types";

export async function getSuppliesDB() {
  return prisma.supply.findMany({ include: { company: true } });
}

export async function getSupplyByIdDB(id: number) {
  return prisma.supply.findFirst({
    where: {
      id,
    },
    include: {
      company: true,
    },
  });
}

export async function createSupplyDB(data: Supply) {
  const { item_qty, package_qty, item_price } = data;
  const { company, ...rest } = data;

  const total_items = item_qty * package_qty;
  const total_price = total_items * item_price;
  return prisma.supply.create({
    data: {
      ...rest,
      total_items,
      total_price,
    },
  });
}

export async function updateSupplyDB(data: Supply, id: number) {
  const { item_qty, package_qty, item_price } = data;
  const { company, ...rest } = data;

  const total_items = item_qty * package_qty;
  const total_price = total_items * item_price;

  return prisma.supply.update({
    where: { id },
    data: {
      ...rest,
      total_items,
      total_price,
    },
  });
}

export async function deleteSupplyDB(id: number) {
  return prisma.supply.delete({
    where: {
      id,
    },
  });
}
