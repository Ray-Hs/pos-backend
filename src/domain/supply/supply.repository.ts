import prisma from "../../infrastructure/database/prisma/client";
import { LIMIT_CONSTANT } from "../../infrastructure/utils/constants";
import { TxClientType } from "../../types/common";
import { Supply } from "./supply.types";
import { addDays } from "date-fns";
export async function getSuppliesDB(
  q?: string | undefined,
  expired?: { expired?: boolean | undefined; days?: number | undefined },
  pagination: { page?: number; limit?: number } = {
    page: 1,
    limit: LIMIT_CONSTANT,
  }
) {
  //? Get supply by company name, product name, invoice number, and company code (case-insensitive)
  const soonDays = expired?.days; // Number of days to consider as "soon"
  const today = new Date();
  let whereClause: any = {};

  if (expired) {
    // Get products that are either expired or expiring soon
    const soonDate = addDays(today, soonDays || 7);
    whereClause = {
      expiryDate: {
        lte: soonDate,
      },
    };
  } else if (q) {
    // Search by query
    whereClause = {
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
          invoiceNO: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    };
  }

  return prisma.supply.findMany({
    include: { company: true },
    where: whereClause,
    take: pagination.limit || LIMIT_CONSTANT,
    skip: Math.abs(
      ((pagination.page || 1) - 1) * (pagination.limit || LIMIT_CONSTANT)
    ),
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
