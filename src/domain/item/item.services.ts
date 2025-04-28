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
  TResult,
} from "../../types/common";
import {
  createItemDB,
  deleteItemDB,
  findItemByIdDB,
  getItemsDB,
  updateItemDB,
} from "./item.repository";
import { MenuItemInterface } from "./item.types";
import Fuse from "fuse.js";

export class MenuItemServices implements MenuItemInterface {
  async getItems(
    subcategoryId?: number,
    sort?: Filter,
    sortby?: FilterBy,
    language?: Language
  ) {
    try {
      console.table([subcategoryId, sort, sortby, language]);
      const data = await getItemsDB(
        {},
        {
          subcategoryId,
          sort,
          sortby,
          language,
        }
      );
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

      return {
        success: true,
        data,
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

  async searchItems(q: any) {
    try {
      const items = await getItemsDB();
      if (!items || items.length === 0) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      const fuse = new Fuse(items, {
        keys: ["title_ku", "title_ar", "title_en"],
      });

      const response = fuse.search(q);
      if (!response || response.length === 0) {
        logger.warn("Not Found");
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
        data: response.map((item) => item.item),
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
