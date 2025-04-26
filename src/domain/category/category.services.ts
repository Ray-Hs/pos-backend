import { ZodError } from "zod";
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
import { CategorySchema, Filter } from "../../types/common";
import { getSubcategoriesByCategoryIdDB } from "../subcategory/subcategory.repository";
import {
  createCategoryDB,
  deleteCategoryDB,
  findCategoryDB,
  getCategoriesDB,
  updateCategoryDB,
} from "./category.repository";
import { CategoryServiceInterface } from "./category.types";

export class CategoryServices implements CategoryServiceInterface {
  async getCategories(filter?: Filter) {
    try {
      const categories = await getCategoriesDB({ _count: true }, filter);
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
      const response = await validateType(
        { id: idRequest },
        CategorySchema.pick({ id: true })
      );

      if (response instanceof ZodError || !response.id) {
        logger.warn("Validation Error: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const data = await findCategoryDB(response.id, { _count: true });
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

      if (category instanceof ZodError) {
        logger.warn("Missing info: ", category);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const data = await createCategoryDB(category, { _count: true });

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
      const idResponse = await validateType(
        { id: idRequest },
        CategorySchema.pick({ id: true })
      );
      const data = await validateType(dataRequest, CategorySchema);

      if (
        idResponse instanceof ZodError ||
        typeof idResponse.id === "undefined"
      ) {
        logger.warn("ID Validation Error: ", idResponse);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      if (data instanceof ZodError) {
        logger.warn("Missing info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const existingCategory = await findCategoryDB(idResponse.id);
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

      const updatedCategory = await updateCategoryDB(idResponse.id, data, {
        _count: true,
      });

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
      const idResponse = await validateType(
        { id: idRequest },
        CategorySchema.pick({ id: true })
      );

      if (
        idResponse instanceof ZodError ||
        typeof idResponse.id === "undefined"
      ) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const existingCategory = await findCategoryDB(idResponse.id);
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

      const subcategories = await getSubcategoriesByCategoryIdDB(
        idResponse.id,
        {
          _count: true,
        }
      );
      if (!subcategories || subcategories.length === 0) {
        const deletedCategory = await deleteCategoryDB(idResponse.id);
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
