import { z, ZodError } from "zod";
import prisma from "../../infrastructure/database/prisma/client";
import { calculatePages } from "../../infrastructure/utils/calculateSkip";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import { createCompanyDebtDB } from "../finance/finance.repository";
import { createItemDB } from "../item/item.repository";
import { getCompanyInfoByIdDB } from "../settings/crm/crm.repository";
import {
  createSupplyDB,
  deleteSupplyDB,
  getStorageCountDB,
  getStorageDB,
  getSuppliesCountDB,
  getSuppliesDB,
  getSupplyByIdDB,
  updateSupplyDB,
} from "./supply.repository";
import { SupplySchema, SupplyServiceInterface } from "./supply.types";

export class SupplyServices implements SupplyServiceInterface {
  async getSupplies(
    q: string | undefined,
    pagination?: {
      limit?: number;
      page?: number;
    },
    expired?: {
      expired?: boolean | undefined;
      days?: number | undefined;
    }
  ) {
    try {
      const data = await getSuppliesDB(q, expired, pagination);
      if (!data) {
        logger.warn("Supplies Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      const totalPages = await getSuppliesCountDB(expired);
      // Calculate total purchase and selling values for IQD and USD based on company currency
      let totalPurchaseValue = { IQD: 0, USD: 0 };
      let totalSellingValue = { IQD: 0, USD: 0 };

      data.forEach((supply) => {
        if (supply.company.currency === "USD") {
          totalPurchaseValue.USD += supply.totalPrice || 0;
          totalSellingValue.USD += supply.itemSellPrice || 0;
        } else {
          totalPurchaseValue.IQD += supply.totalPrice || 0;
          totalSellingValue.IQD += supply.itemSellPrice || 0;
        }
      });

      const potentialProfit = {
        IQD: totalSellingValue.IQD - totalPurchaseValue.IQD,
        USD: totalSellingValue.USD - totalPurchaseValue.USD,
      };

      return {
        success: true,
        data,
        totalPurchaseValue,
        totalSellingValue,
        potentialProfit,
        pages: calculatePages(totalPages, pagination?.limit),
      };
    } catch (error) {
      logger.error("Get Supplies: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getStores() {
    try {
      const stores = await prisma.supply.findMany({
        select: {
          store: true,
        },
        distinct: ["store"],
      });
      const storeNames = stores
        .map((s) => s.store)
        .filter((name): name is string => typeof name === "string");

      if (!stores || stores.length <= 0) {
        logger.warn("Error no stores found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      return { success: true, data: storeNames };
    } catch (error) {
      logger.error("Get Stores: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async getStorage(
    q?: string | undefined,
    pagination?: {
      limit?: number;
      page?: number;
    },
    expired?: {
      expired?: boolean | undefined;
      days?: number | undefined;
    }
  ) {
    try {
      const response = await getStorageDB(q, expired, pagination);
      if (!response || response.stores.length === 0) {
        logger.warn("Storage Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const totalPages = await getStorageCountDB(q, expired);
      return {
        success: true,
        data: response,
        pages: calculatePages(totalPages, pagination?.limit),
      };
    } catch (error) {
      logger.error("Get Storage: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getSupplyById(requestId: any) {
    try {
      const validated = await validateType(
        { id: requestId },
        SupplySchema.pick({ id: true })
      );
      if (!validated || validated instanceof ZodError || !validated.id) {
        logger.warn("Type Error: ", validated);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await getSupplyByIdDB(validated.id);
      if (!data) {
        logger.warn("Supply Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Supply By Id: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createSupply(requestData: any) {
    try {
      const data = await validateType(
        requestData,
        SupplySchema.extend({
          isMenuItem: z.boolean().optional(),
          subCategoryId: z.number().nullable().optional(),
          printersId: z.number().nullable().optional(),
          code: z.string().optional(),
          image: z.string().optional(),
          discount: z.number().optional(),
        })
      );
      if (!data || data instanceof ZodError) {
        logger.warn("Error: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const createdSupply = await prisma.$transaction(async (tx) => {
        const company = await getCompanyInfoByIdDB(data.companyId, tx);

        if (!company) {
          throw new Error(`No Company Exists with id: ${data.companyId}`);
        }
        const totalItems = data.itemQty * data.packageQty;
        const totalPrice = totalItems * data.itemPrice;

        if (data.paymentMethod === "DEBT") {
          console.log("Data: ", data);
          console.table(["Debt", totalItems, totalPrice]);
          const createdDebt = await createCompanyDebtDB(
            {
              price: Math.round((totalPrice || 0) / (totalItems || 0)),
              product: data.name,
              quantity: totalItems || 0,
              companyId: company?.id,
              currency: company?.currency || "IQD",
              invoiceNumber: data.invoiceNO,
              totalAmount: totalPrice,
              userId: requestData.userId,
            },
            tx
          );
        }

        const itemsExists = await tx.menuItem.findFirst({
          where: {
            OR: [
              {
                title_en: {
                  equals: data.name,
                  mode: "insensitive",
                },
              },
              {
                title_ku: {
                  equals: data.name,
                  mode: "insensitive",
                },
              },
              {
                title_ar: {
                  equals: data.name,
                  mode: "insensitive",
                },
              },
            ],
          },
        });

        if (data.isMenuItem && !itemsExists) {
          await createItemDB({
            code: data.code || "",
            description_ar: "",
            description_en: "",
            description_ku: "",
            title_ar: data.name,
            title_en: data.name,
            title_ku: data.name,
            price: data.itemSellPrice,
            companyId: company.id,
            company,
            image: data.image,
            subCategoryId: data.subCategoryId || null,
            discount: data.discount || 0,
            isActive: true,
            printersId: data.printersId || null,
          });
        }

        const {
          isMenuItem,
          subCategoryId,
          printersId,
          code,
          image,
          discount,
          ...rest
        } = data;

        const createdSupply = await createSupplyDB(rest, tx);
      });
      return {
        success: true,
        message: "Created Supply Successfully",
      };
    } catch (error) {
      logger.error("Create Supply: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateSupply(requestData: any, requestId: any) {
    try {
      const data = await validateType(requestData, SupplySchema);
      if (!data || data instanceof ZodError) {
        logger.warn("Error: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const id = await validateType(
        { id: requestId },
        SupplySchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await prisma.$transaction(async (tx) => {
        const company = await getCompanyInfoByIdDB(data.companyId, tx);

        if (!company) {
          throw new Error(`No Company Exists with id: ${data.companyId}`);
        }
        const totalItems = data.itemQty * data.packageQty;
        const totalPrice = totalItems * data.itemPrice;
        const prevSupply = await getSupplyByIdDB(id.id as number);

        if (
          data.paymentMethod === "DEBT" &&
          prevSupply?.paymentMethod !== "DEBT"
        ) {
          const createdDebt = await tx.companyDebt.create({
            data: {
              price: Math.round((totalPrice || 0) / (totalItems || 0)),
              product: data.name,
              quantity: totalItems || 0,
              companyId: company?.id,
              currency: company?.currency || "IQD",
              invoiceNumber: data.invoiceNO,
              totalAmount: totalPrice,
              userId: requestData.userId,
            },
          });
        }

        await updateSupplyDB(data, id.id as number);
      });
      return {
        success: true,
        message: "Updated Supply Successfully",
      };
    } catch (error) {
      logger.error("Update Supply: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteSupply(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        SupplySchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      await deleteSupplyDB(id.id);
      return {
        success: true,
        message: "Deleted Supply Successfully",
      };
    } catch (error) {
      logger.error("Delete Supply: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
}
