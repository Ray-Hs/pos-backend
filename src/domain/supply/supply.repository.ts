import prisma from "../../infrastructure/database/prisma/client";
import { calculateSkip, Take } from "../../infrastructure/utils/calculateSkip";
import { LIMIT_CONSTANT } from "../../infrastructure/utils/constants";
import { TxClientType } from "../../types/common";
import { Supply } from "./supply.types";
import { addDays } from "date-fns";
export async function getSuppliesDB(
  q?: string | undefined,
  expired?: { expired?: boolean | undefined; days?: number | undefined },
  pagination?: { page?: number; limit?: number }
) {
  //? Get supply by company name, product name, invoice number, and company code (case-insensitive)
  const soonDays = expired?.days; // Number of days to consider as "soon"
  const today = new Date();
  let whereClause: any = {};

  if (expired?.expired) {
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

  console.table([whereClause]);

  return prisma.supply.findMany({
    include: { company: true },
    where: whereClause,
    take: Take(pagination?.limit),
    skip: calculateSkip(pagination?.page, pagination?.limit),
  });
}

export async function getStorageDB(
  q?: string | undefined,
  expired?: { expired?: boolean | undefined; days?: number | undefined },
  pagination?: { page?: number; limit?: number }
): Promise<any[]> {
  const soonDays = expired?.days; // Number of days to consider as "soon"
  const today = new Date();
  let whereClause: any = {
    remainingQuantity: {
      gt: 0, // Only items with remaining quantity
    },
  };

  if (expired?.expired) {
    // Get products that are either expired or expiring soon
    const soonDate = addDays(today, soonDays || 7);
    whereClause.expiryDate = {
      lte: soonDate,
    };
  } else if (q) {
    // Search by query
    whereClause.OR = [
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
    ];
  }

  // Get all supplies with remaining quantity
  const supplies = await prisma.supply.findMany({
    where: whereClause,
    include: {
      company: true,
    },
    orderBy: [
      { name: "asc" },
      { store: "asc" },
      { expiryDate: "asc" },
    ],
    take: Take(pagination?.limit),
    skip: calculateSkip(pagination?.page, pagination?.limit),
  });

  // Group supplies by item name and store
  const storageMap = new Map<string, any>();

  for (const supply of supplies) {
    const key = `${supply.name}-${supply.store || 'default'}`;
    
    if (!storageMap.has(key)) {
      storageMap.set(key, {
        item: supply.name,
        quantity: 0,
        price: supply.itemPrice,
        sellPrice: supply.itemSellPrice,
        totalValue: 0,
        profit: 0,
        companyDetails: {
          id: supply.company.id,
          name: supply.company.name,
          code: supply.company.code,
          phoneNumber: supply.company.phoneNumber,
          note: supply.company.note,
        },
        store: supply.store,
        itemCode: supply.barcode,
        expiryDate: supply.expiryDate,
        lastRestock: supply.createdAt,
        lastSale: null, // Will be updated if we find sales data
      });
    }

    const storageItem = storageMap.get(key);
    storageItem.quantity += supply.remainingQuantity || 0;
    storageItem.totalValue += (supply.remainingQuantity || 0) * supply.itemPrice;
    storageItem.profit += (supply.remainingQuantity || 0) * (supply.itemSellPrice - supply.itemPrice);
    
    // Update earliest expiry date
    if (supply.expiryDate && (!storageItem.expiryDate || supply.expiryDate < storageItem.expiryDate)) {
      storageItem.expiryDate = supply.expiryDate;
    }
    
    // Update latest restock date
    if (supply.createdAt && (!storageItem.lastRestock || supply.createdAt > storageItem.lastRestock)) {
      storageItem.lastRestock = supply.createdAt;
    }
  }

  // Try to get last sale information for each item
  // Note: This is a simplified approach. You might want to create a more sophisticated query
  // that joins with order items to get actual sales data
  for (const [key, storageItem] of storageMap) {
    // For now, we'll set lastSale to null as it requires joining with order data
    // You can implement this later by querying order items that match the item name
    storageItem.lastSale = null;
  }

  return Array.from(storageMap.values());
}

export async function getSuppliesCountDB(expired?: {
  expired?: boolean | undefined;
  days?: number | undefined;
}) {
  //? Get supply by company name, product name, invoice number, and company code (case-insensitive)
  const soonDays = expired?.days; // Number of days to consider as "soon"
  const today = new Date();
  let whereClause: any = {
    remainingQuantity: {
      gt: 0, // Only items with remaining quantity
    },
  };

  if (expired?.expired) {
    // Get products that are either expired or expiring soon
    const soonDate = addDays(today, soonDays || 7);
    whereClause.expiryDate = {
      lte: soonDate,
    };
  }

  return prisma.supply.count({
    where: whereClause,
  });
}

export async function getStorageCountDB(
  q?: string | undefined,
  expired?: { expired?: boolean | undefined; days?: number | undefined }
) {
  const soonDays = expired?.days;
  const today = new Date();
  let whereClause: any = {
    remainingQuantity: {
      gt: 0,
    },
  };

  if (expired?.expired) {
    const soonDate = addDays(today, soonDays || 7);
    whereClause.expiryDate = {
      lte: soonDate,
    };
  } else if (q) {
    whereClause.OR = [
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
    ];
  }

  // Get unique item-store combinations count
  const supplies = await prisma.supply.findMany({
    where: whereClause,
    select: {
      name: true,
      store: true,
    },
  });

  const uniqueItems = new Set();
  supplies.forEach(supply => {
    uniqueItems.add(`${supply.name}-${supply.store || 'default'}`);
  });

  return uniqueItems.size;
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
