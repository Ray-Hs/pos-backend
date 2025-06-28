import prisma from "../../infrastructure/database/prisma/client";
import { TxClientType } from "../../types/common";
import { Supply } from "./supply.types";
export async function getSuppliesDB(q: string | undefined) {
  //? Get supply by company name, product name, invoice number, and company code (case-insensitive)
  return prisma.supply.findMany({
    include: { company: true },
    where: q
      ? {
          OR: [
            {
              company: {
                name: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
            {
              barcode: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              company: {
                code: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            },
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              barcode: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              invoiceNO: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
  });
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

export async function getSupplyByProductCode(
  code: string,
  client: TxClientType
) {
  return client.supply.findFirst({
    where: {
      barcode: code,
    },
  });
}

export async function createSupplyDB(data: Supply, client: TxClientType) {
  const { itemQty, packageQty, itemPrice } = data;
  const { company, ...rest } = data;

  const totalItems = itemQty * packageQty;
  const totalPrice = totalItems * itemPrice;
  return client.supply.create({
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
