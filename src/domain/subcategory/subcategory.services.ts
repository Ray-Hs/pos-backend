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
import { Filter, SubCategory, SubCategorySchema } from "../../types/common";
import { findItemBySubCategoryIdDB } from "../item/item.repository";
import {
  createSubcategoryDB,
  deleteSubcategoryDB,
  findSubcategoryByIdDB,
  getSubcategoriesByCategoryIdDB,
  getSubcategoriesDB,
  updateSubcategoryDB,
} from "./subcategory.repository";
import { SubcategoryServiceInterface } from "./subcategory.types";

export class SubcategoryServices implements SubcategoryServiceInterface {
  async getSubcategories(filter?: Filter) {
    try {
      const data = await getSubcategoriesDB(filter);
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

      const formattedSubcategory: SubCategory[] = data.map((subcategory) => {
        return {
          id: subcategory.id,
          categoryId: subcategory.categoryId,
          title_ar: subcategory.title_ar,
          title_en: subcategory.title_en,
          title_ku: subcategory.title_ku,
          description_ar: subcategory.description_ar,
          description_en: subcategory.description_en,
          description_ku: subcategory.description_ku,
          isActive: subcategory.isActive,
          sortOrder: subcategory.sortOrder,
          image: subcategory.image,
          itemsCount: subcategory._count.items,
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
        };
      });

      return {
        success: true,
        data: formattedSubcategory,
      };
    } catch (error) {
      logger.error("Get Subcategory Service: ", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }

  async getSubcategoriesByCategoryIdDB(id: any) {
    try {
      const response = await validateType(
        { categoryId: id },
        SubCategorySchema.pick({ categoryId: true })
      );

      if (response instanceof ZodError || !response.categoryId) {
        logger.warn("Category Id missing");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const data = await getSubcategoriesByCategoryIdDB(response.categoryId);
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

      const formattedSubcategory: SubCategory[] = data.map((subcategory) => {
        return {
          id: subcategory.id,
          categoryId: subcategory.categoryId,
          title_ar: subcategory.title_ar,
          title_en: subcategory.title_en,
          title_ku: subcategory.title_ku,
          description_ar: subcategory.description_ar,
          description_en: subcategory.description_en,
          description_ku: subcategory.description_ku,
          isActive: subcategory.isActive,
          sortOrder: subcategory.sortOrder,
          image: subcategory.image,
          itemsCount: subcategory._count.items,
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
        };
      });

      return {
        success: true,
        data: formattedSubcategory,
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
      const response = await validateType(
        { id: requestId },
        SubCategorySchema.pick({ id: true })
      );
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

      const data = await findSubcategoryByIdDB(response.id);

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

      const formattedSubcategory: SubCategory = {
        id: data.id,
        categoryId: data.categoryId,
        title_ar: data.title_ar,
        title_en: data.title_en,
        title_ku: data.title_ku,
        description_ar: data.description_ar,
        description_en: data.description_en,
        description_ku: data.description_ku,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        image: data.image,
        itemsCount: data._count.items,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      return {
        success: true,
        data: formattedSubcategory,
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
      if (data instanceof ZodError) {
        logger.warn("Missing Data: ", data);
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
            details: data,
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
      const response = await validateType(
        { id: requestId },
        SubCategorySchema.pick({ id: true })
      );
      const data = await validateType(requestData, SubCategorySchema);

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

      const existingSubcategory = await findSubcategoryByIdDB(response.id);
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

      const updatedData = await updateSubcategoryDB(response.id, data);
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
      const response = await validateType(
        { id: requestId },
        SubCategorySchema.pick({ id: true })
      );

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

      const existingSubcategory = await findSubcategoryByIdDB(response.id);
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
      const items = await findItemBySubCategoryIdDB(response.id);
      logger.info(JSON.stringify(items));
      if (!items || items.length === 0) {
        const deletedSubcategory = await deleteSubcategoryDB(response.id);
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
