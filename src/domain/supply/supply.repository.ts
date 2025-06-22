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
  const { itemQty, packageQty, itemPrice } = data;
  const { company, ...rest } = data;

  const totalItems = itemQty * packageQty;
  const totalPrice = totalItems * itemPrice;
  return prisma.supply.create({
    data: {
      ...rest,
      totalItems,
      totalPrice,
    },
  });
}

export async function updateSupplyDB(data: Supply, id: number) {
  const { itemQty, packageQty, itemPrice } = data;
  const { company, ...rest } = data;

  const totalItems = itemQty * packageQty;
  const totalPrice = totalItems * itemPrice;

  return prisma.supply.update({
    where: { id },
    data: {
      ...rest,
      totalItems,
      totalPrice,
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
