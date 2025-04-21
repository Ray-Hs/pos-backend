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
import { Category, CategorySchema } from "../../types/common";
import { getSubcategoriesDB } from "../subcategory/subcategory.repository";
import {
  createCategoryDB,
  deleteCategoryDB,
  findCategoryDB,
  getCategoriesDB,
  updateCategoryDB,
} from "./category.repository";
import { CategoryServiceInterface } from "./category.types";

export class CategoryServices implements CategoryServiceInterface {
  async getCategories() {
    try {
      const categories = await getCategoriesDB();
      if (!categories || categories.length === 0) {
        logger.warn("Get Categories Service Has No Entries.");
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
        data: categories,
      };
    } catch (error) {
      logger.error("Get Categories Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async findCategoryById(idRequest: any) {
    try {
      const id = (
        await validateType({ id: idRequest }, CategorySchema.pick({ id: true }))
      )?.id;

      if (!id) {
        logger.warn("Id Not Provided");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const data = await findCategoryDB(id);
      if (!data) {
        logger.error("There is no Category");
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
      logger.error("Find Category By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createCategory(dataRequest: any) {
    try {
      const category = await validateType(dataRequest, CategorySchema);

      if (!category) {
        logger.warn("Missing info: ", category);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const data = await createCategoryDB(category);

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Create Category Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateCategory(idRequest: any, dataRequest: any) {
    try {
      const id = (
        await validateType({ id: idRequest }, CategorySchema.pick({ id: true }))
      )?.id;
      const data = await validateType(dataRequest, CategorySchema);

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
        logger.warn("Missing info");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const existingCategory = await findCategoryDB(id);
      if (!existingCategory) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const updatedCategory = await updateCategoryDB(id, data);

      return {
        success: true,
        data: updatedCategory,
      };
    } catch (error) {
      logger.error("Update Category Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteCategory(idRequest: any) {
    try {
      const id = (
        await validateType({ id: idRequest }, CategorySchema.pick({ id: true }))
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

      const existingCategory = await findCategoryDB(id);
      if (!existingCategory) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const subcategories = await getSubcategoriesDB();
      if (!subcategories || subcategories.length === 0) {
        const deletedCategory = await deleteCategoryDB(id);
        return {
          success: true,
          data: deletedCategory,
        };
      }

      return {
        success: false,
        error: {
          code: BAD_REQUEST_STATUS,
          message: BAD_REQUEST_DELETE_ERR,
        },
      };
    } catch (error) {
      logger.error("Delete Category Service: ", error);
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
