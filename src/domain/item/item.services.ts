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
import { MenuItemSchema } from "../../types/common";
import {
  createItemDB,
  deleteItemDB,
  findItemByIdDB,
  getItemsDB,
  updateItemDB,
} from "./item.repository";
import { MenuItemInterface } from "./item.types";

export class MenuItemServices implements MenuItemInterface {
  async getItems() {
    try {
      const data = await getItemsDB();
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
      const id = (await validateType({ id: requestId }, MenuItemSchema))?.id;
      if (!id) {
        logger.warn("No ID Provided");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const item = await findItemByIdDB(id);
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
      if (!data) {
        logger.warn("Missing Info");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
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
      const id = (
        await validateType({ id: requestId }, MenuItemSchema.pick({ id: true }))
      )?.id;
      const data = await validateType(requestData, MenuItemSchema);

      if (!id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      if (!data) {
        logger.warn("Missing Data");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const existingItem = await findItemByIdDB(id);
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

      const updatedData = await updateItemDB(id, data);
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
        },
      };
    }
  }

  async deleteItem(requestId: any) {
    try {
      const id = (
        await validateType({ id: requestId }, MenuItemSchema.pick({ id: true }))
      )?.id;

      if (!id) {
        logger.warn("No ID Provided");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const existingItem = await findItemByIdDB(id);
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

      const deletedItem = await deleteItemDB(id);
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
