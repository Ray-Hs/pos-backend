import { ZodError } from "zod";
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
import {
  Filter,
  FilterBy,
  Language,
  MenuItem,
  MenuItemSchema,
} from "../../types/common";
import {
  createItemDB,
  deleteItemDB,
  findItemByIdDB,
  getItemsByCategoryDB,
  getItemsDB,
  updateItemDB,
} from "./item.repository";
import { MenuItemInterface } from "./item.types";

export class MenuItemServices implements MenuItemInterface {
  async getItems(
    q?: string,
    subcategoryId?: number,
    sort?: Filter,
    sortby?: FilterBy,
    language?: Language
  ) {
    try {
      console.table([subcategoryId, sort, sortby, language, q]);
      const data = await getItemsDB({
        q,
        subcategoryId,
        sort,
        sortby,
        language,
      });
      if (!data || data.length === 0) {
        logger.warn("NOT FOUND");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const formattedItems: MenuItem[] = data.map((item) => {
        const categoryId = item.SubCategory?.Category?.id || null;
        const category = {
          title_ar: item.SubCategory?.Category?.title_ar || "",
          title_ku: item.SubCategory?.Category?.title_ku || "",
          title_en: item.SubCategory?.Category?.title_en || "",
        };
        const subcategory = {
          title_ar: item.SubCategory?.title_ar || "",
          title_ku: item.SubCategory?.title_ku || "",
          title_en: item.SubCategory?.title_en || "",
        };
        const company = item.company
          ? {
              name: item.company.name,
              currency: item.company.currency ?? null,
              phoneNumber: item.company.phoneNumber ?? "",
              id: item.company.id,
              code: item.company.code ?? null,
              email: item.company.email ?? null,
              note: item.company.note ?? null,
              CRMId: item.company.CRMId ?? undefined,
            }
          : null;
        return {
          id: item.id,
          title_ar: item.title_ar,
          title_ku: item.title_ku,
          title_en: item.title_en,
          description_ar: item.description_ar,
          description_en: item.description_en,
          description_ku: item.description_ku,
          discount: item.discount,
          isActive: item.isActive,
          price: item.price,
          subCategoryId: item.subCategoryId,
          categoryId,
          companyId: item.companyId,
          company: company,
          image: item.image,
          category,
          subcategory,
          printersId: item.printersId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });

      return {
        success: true,
        data: formattedItems,
      };
    } catch (error) {
      logger.error("Menu item Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async searchItems(q?: string) {
    try {
      const data = await getItemsDB({
        q,
      });
      if (!data || data.length === 0) {
        logger.warn("NOT FOUND");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const formattedItems: MenuItem[] = data.map((item) => {
        const categoryId = item.SubCategory?.Category?.id || null;
        const category = {
          title_ar: item.SubCategory?.Category?.title_ar || "",
          title_ku: item.SubCategory?.Category?.title_ku || "",
          title_en: item.SubCategory?.Category?.title_en || "",
        };
        const subcategory = {
          title_ar: item.SubCategory?.title_ar || "",
          title_ku: item.SubCategory?.title_ku || "",
          title_en: item.SubCategory?.title_en || "",
        };
        const company = item.company
          ? {
              name: item.company.name,
              currency: item.company.currency ?? null,
              phoneNumber: item.company.phoneNumber ?? "",
              id: item.company.id,
              code: item.company.code ?? null,
              email: item.company.email ?? null,
              note: item.company.note ?? null,
              CRMId: item.company.CRMId ?? undefined,
            }
          : null;
        return {
          id: item.id,
          title_ar: item.title_ar,
          title_ku: item.title_ku,
          title_en: item.title_en,
          description_ar: item.description_ar,
          description_en: item.description_en,
          description_ku: item.description_ku,
          discount: item.discount,
          isActive: item.isActive,
          price: item.price,
          subCategoryId: item.subCategoryId,
          categoryId,
          companyId: item.companyId,
          company: company,
          image: item.image,
          category,
          subcategory,
          printersId: item.printersId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });

      return {
        success: true,
        data: formattedItems,
      };
    } catch (error) {
      logger.error("Menu item Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async getItemsByCategory(
    id: any,
    q?: string,
    subcategoryId?: number,
    sort?: Filter,
    sortby?: FilterBy,
    language?: Language
  ) {
    try {
      console.table([id, subcategoryId, sort, sortby, language, q]);
      const data = await getItemsByCategoryDB(id, {
        q,
        subcategoryId,
        sort,
        sortby,
        language,
      });
      if (!data || data.length === 0) {
        logger.warn("NOT FOUND");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const formattedItems: MenuItem[] = data.map((item) => {
        const categoryId = item.SubCategory?.Category?.id || null;
        const category = {
          title_ar: item.SubCategory?.Category?.title_ar || "",
          title_ku: item.SubCategory?.Category?.title_ku || "",
          title_en: item.SubCategory?.Category?.title_en || "",
        };
        const subcategory = {
          title_ar: item.SubCategory?.title_ar || "",
          title_ku: item.SubCategory?.title_ku || "",
          title_en: item.SubCategory?.title_en || "",
        };
        const company = item.company
          ? {
              name: item.company.name,
              currency: item.company.currency ?? null,
              phoneNumber: item.company.phoneNumber ?? "",
              id: item.company.id,
              code: item.company.code ?? null,
              email: item.company.email ?? null,
              note: item.company.note ?? null,
              CRMId: item.company.CRMId ?? undefined,
            }
          : null;
        return {
          id: item.id,
          title_ar: item.title_ar,
          title_ku: item.title_ku,
          title_en: item.title_en,
          description_ar: item.description_ar,
          description_en: item.description_en,
          description_ku: item.description_ku,
          discount: item.discount,
          isActive: item.isActive,
          price: item.price,
          subCategoryId: item.subCategoryId,
          categoryId,
          companyId: item.companyId,
          company: company,
          image: item.image,
          category,
          subcategory,
          printersId: item.printersId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });

      return {
        success: true,
        data: formattedItems,
      };
    } catch (error) {
      logger.error("Menu item Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getItemById(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        MenuItemSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        logger.warn("No ID Provided");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const item = await findItemByIdDB(response.id);
      if (!item) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return {
        success: true,
        data: item,
      };
    } catch (error) {
      logger.error("Menu item Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createItem(requestData: any) {
    try {
      const data = await validateType(requestData, MenuItemSchema);
      if (data instanceof ZodError) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
            details: data,
          },
        };
      }

      const createdItem = await createItemDB(data);

      return {
        success: true,
        data: createdItem,
      };
    } catch (error) {
      logger.error("Menu item Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateItem(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        MenuItemSchema.pick({ id: true })
      );
      const data = await validateType(requestData, MenuItemSchema);

      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      if (data instanceof ZodError) {
        logger.warn("Missing Data: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
            details: data,
          },
        };
      }

      const existingItem = await findItemByIdDB(response.id);
      if (!existingItem) {
        logger.warn("No Item Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const updatedData = await updateItemDB(response.id, data);
      return {
        success: true,
        data: updatedData,
      };
    } catch (error) {
      logger.error("Menu item Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
          details: error,
        },
      };
    }
  }

  async deleteItem(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        MenuItemSchema.pick({ id: true })
      );

      if (response instanceof ZodError || !response.id) {
        logger.warn("No ID Provided");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const existingItem = await findItemByIdDB(response.id);
      if (!existingItem) {
        logger.error("No Item Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const deletedItem = await deleteItemDB(response.id);
      return {
        success: true,
        data: deletedItem,
      };
    } catch (error) {
      logger.error("Menu item Service: ", error);
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
