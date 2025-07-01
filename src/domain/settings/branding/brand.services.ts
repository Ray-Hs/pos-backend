import { ZodError } from "zod";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../../infrastructure/utils/constants";
import logger from "../../../infrastructure/utils/logger";
import validateType from "../../../infrastructure/utils/validateType";
import {
  createBrandDB,
  deleteBrandDB,
  getBrandDB,
  updateBrandDB,
} from "./brand.repository";
import { BrandObject, BrandServiceInterface } from "./brand.types";
import prisma from "../../../infrastructure/database/prisma/client";

export class BrandServices implements BrandServiceInterface {
  async getBrand() {
    try {
      const data = await getBrandDB(prisma);

      if (!data) {
        logger.warn("Brand Not Found");
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
      logger.error("Get Brand: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createBrand(requestData: any) {
    try {
      const data = await validateType(requestData, BrandObject);
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

      const createdBrand = await createBrandDB(data);
      return {
        success: true,
        message: "Created Brand Successfully",
      };
    } catch (error) {
      logger.error("Create Brand: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async updateBrand(requestData: any, requestId: any) {
    try {
      const data = await validateType(requestData, BrandObject);
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
        BrandObject.pick({ id: true })
      );

      if (!id || id instanceof ZodError) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      if (!id.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const updatedBrand = await updateBrandDB(id.id, data);

      return {
        success: true,
        message: "Updated Brand Successfully",
      };
    } catch (error) {
      logger.error("Update Brand: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteBrand(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        BrandObject.pick({ id: true })
      );

      if (!id || id instanceof ZodError) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      if (!id.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const deletedBrand = await deleteBrandDB(id.id);

      return {
        success: true,
        message: "Deleted Brand Successfully",
      };
    } catch (error) {
      logger.error("Delete Brand: ", error);
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
