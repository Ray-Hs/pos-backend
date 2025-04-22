import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_DELETE_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import { SubCategory, SubCategorySchema } from "../../types/common";
import { findItemBySubCategoryIdDB, getItemsDB } from "../item/item.repository";
import {
  createSubcategoryDB,
  deleteSubcategoryDB,
  findSubcategoryByIdDB,
  getSubcategoriesDB,
  updateSubcategoryDB,
} from "./subcategory.repository";
import { SubcategoryServiceInterface } from "./subcategory.types";

export class SubcategoryServices implements SubcategoryServiceInterface {
  async getSubcategories() {
    try {
      const data = await getSubcategoriesDB();
      if (!data || data.length === 0) {
        logger.warn("No subcategories found.");
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
      logger.error("Get Subcategory Service: ", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async getSubcategoryById(requestId: any) {
    try {
      const id = (await validateType({ id: requestId }, SubCategorySchema))?.id;
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

      const data = await findSubcategoryByIdDB(id);

      if (!data) {
        logger.warn("No Subcategory found");
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
      logger.error("Get Subcategory By ID Service: ", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async createSubcategory(requestData: any) {
    try {
      const data = await validateType(requestData, SubCategorySchema);
      if (!data) {
        logger.warn("Missing Data");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      const createdData = await createSubcategoryDB(data);

      return {
        success: true,
        data: createdData,
      };
    } catch (error) {
      logger.error("Create Subcategory Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateSubcategory(requestId: any, requestData: any) {
    try {
      const id = (await validateType({ id: requestId }, SubCategorySchema))?.id;
      const data = await validateType(requestData, SubCategorySchema);

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
        logger.warn("Missing Info");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const existingSubcategory = await findSubcategoryByIdDB(id);
      if (!existingSubcategory) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const updatedData = await updateSubcategoryDB(id, data);
      return {
        success: true,
        data: updatedData,
      };
    } catch (error) {
      logger.error("Create Subcategory Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteSubcategory(requestId: any) {
    try {
      const id = (
        await validateType(
          { id: requestId },
          SubCategorySchema.pick({ id: true })
        )
      )?.id;

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

      const existingSubcategory = await findSubcategoryByIdDB(id);
      if (!existingSubcategory) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      const items = await findItemBySubCategoryIdDB(id);
      logger.info(JSON.stringify(items));
      if (!items || items.length === 0) {
        const deletedSubcategory = await deleteSubcategoryDB(id);
        return {
          success: true,
          data: deletedSubcategory,
        };
      }

      //? If There are items in the menu then return a delete message.
      return {
        success: false,
        error: {
          code: BAD_REQUEST_STATUS,
          message: BAD_REQUEST_DELETE_ERR,
        },
      };
    } catch (error) {
      logger.error("Create Subcategory Service: ", error);
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
