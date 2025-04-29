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
import { Category, CategorySchema, Filter } from "../../types/common";
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
      const categories = await getCategoriesDB(filter);
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

      const formattedCategories = categories.map((category) => {
        const itemsCount = category.subCategory.reduce(
          (acc, subcategory) => acc + subcategory._count.items,
          0
        );

        return {
          id: category.id,
          title_en: category.title_en,
          title_ku: category.title_ku,
          title_ar: category.title_ar,
          description_en: category.description_en,
          description_ku: category.description_ku,
          description_ar: category.description_ar,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          image: category.image,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          itemsCount,
          subcategoryCount: category._count.subCategory,
        };
      });

      return {
        success: true,
        data: formattedCategories,
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

      const data = await findCategoryDB(response.id);
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

      const itemsCount = data.subCategory.reduce(
        (acc, subcategory) => acc + subcategory._count.items,
        0
      );
      const formattedCategory = {
        id: data.id,
        title_en: data.title_en,
        title_ku: data.title_ku,
        title_ar: data.title_ar,
        description_en: data.description_en,
        description_ku: data.description_ku,
        description_ar: data.description_ar,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        image: data.image,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        itemsCount,
        subcategoryCount: data._count.subCategory,
      };
      return {
        success: true,
        data: formattedCategory,
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
            details: category,
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
            details: data,
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

      const updatedCategory = await updateCategoryDB(idResponse.id, data);

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
