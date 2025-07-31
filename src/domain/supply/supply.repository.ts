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
): Promise<any> {
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
    orderBy: [{ store: "asc" }, { name: "asc" }, { expiryDate: "asc" }],
    take: Take(pagination?.limit),
    skip: calculateSkip(pagination?.page, pagination?.limit),
  });

  // Group supplies by store location
  const storeMap = new Map<string, any>();
  let totalItems = 0;
  let totalValue = 0;
  let totalProfit = 0;

  // Track totals by currency
  const currencyTotals = new Map<
    string,
    {
      currency: string;
      totalItems: number;
      totalValue: number;
      totalProfit: number;
    }
  >();

  for (const supply of supplies) {
    const storeName = supply.store || "Default Store";
    const currency = supply.company.currency || "USD"; // Default currency if not specified

    if (!storeMap.has(storeName)) {
      storeMap.set(storeName, {
        storeName,
        items: new Map(), // Use Map to handle duplicate items
        totalItems: 0,
        totalValue: 0,
        totalProfit: 0,
      });
    }

    const store = storeMap.get(storeName);
    const itemKey = `${supply.name}-${supply.barcode || "no-barcode"}`;

    const itemQuantity = supply.remainingQuantity || 0;
    const itemValue = itemQuantity * supply.itemPrice;
    const itemProfit = itemQuantity * (supply.itemSellPrice - supply.itemPrice);

    if (!store.items.has(itemKey)) {
      // Create new storage item
      const storageItem = {
        item: supply.name,
        quantity: itemQuantity,
        price: supply.itemPrice,
        sellPrice: supply.itemSellPrice,
        totalValue: itemValue,
        profit: itemProfit,
        companyDetails: {
          id: supply.company.id,
          name: supply.company.name,
          currency: supply.company.currency,
          code: supply.company.code,
          phoneNumber: supply.company.phoneNumber,
          note: supply.company.note,
        },
        store: supply.store,
        itemCode: supply.barcode,
        expiryDate: supply.expiryDate,
        lastRestock: supply.createdAt,
        lastSale: null, // Will be updated if we find sales data
      };

      store.items.set(itemKey, storageItem);
    } else {
      // Update existing item (combine quantities)
      const existingItem = store.items.get(itemKey);
      existingItem.quantity += itemQuantity;
      existingItem.totalValue += itemValue;
      existingItem.profit += itemProfit;

      // Update earliest expiry date
      if (
        supply.expiryDate &&
        (!existingItem.expiryDate ||
          supply.expiryDate < existingItem.expiryDate)
      ) {
        existingItem.expiryDate = supply.expiryDate;
      }

      // Update latest restock date
      if (
        supply.createdAt &&
        (!existingItem.lastRestock ||
          supply.createdAt > existingItem.lastRestock)
      ) {
        existingItem.lastRestock = supply.createdAt;
      }
    }

    // Update currency totals
    if (!currencyTotals.has(currency)) {
      currencyTotals.set(currency, {
        currency,
        totalItems: 0,
        totalValue: 0,
        totalProfit: 0,
      });
    }

    const currencyTotal = currencyTotals.get(currency);
    if (currencyTotal) {
      currencyTotal.totalItems += itemQuantity;
      currencyTotal.totalValue += itemValue;
      currencyTotal.totalProfit += itemProfit;
    }
  }

  // Calculate store totals and convert items Map to array
  for (const [storeName, store] of storeMap) {
    store.items = Array.from(store.items.values()).sort((a: any, b: any) =>
      a.item.localeCompare(b.item)
    );

    for (const item of store.items) {
      store.totalItems += item.quantity;
      store.totalValue += item.totalValue;
      store.totalProfit += item.profit;

      // Update overall totals
      totalItems += item.quantity;
      totalValue += item.totalValue;
      totalProfit += item.profit;
    }
  }

  // Convert map to array and sort stores
  const stores = Array.from(storeMap.values()).sort((a, b) =>
    a.storeName.localeCompare(b.storeName)
  );

  // Convert currency totals to array and sort by currency
  const totalsByCurrency = Array.from(currencyTotals.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency)
  );

  return {
    stores,
    totalStores: stores.length,
    totalItems,
    totalValue,
    totalProfit,
    totalsByCurrency, // New field with currency-categorized totals
  };
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

  // Count unique stores
  const supplies = await prisma.supply.findMany({
    where: whereClause,
    select: {
      store: true,
    },
  });

  const uniqueStores = new Set();
  supplies.forEach((supply) => {
    uniqueStores.add(supply.store || "Default Store");
  });

  return uniqueStores.size;
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
      remainingQuantity: totalItems,
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
