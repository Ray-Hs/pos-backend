import { ZodError } from "zod";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import {
  createConstantsDB,
  deleteConstantsDB,
  getConstantsDB,
  updateConstantsDB,
} from "./constants.repository";
import { ConstantSchema, IConstantServices } from "./constants.types";

export class ConstantsService implements IConstantServices {
  async getConstants() {
    try {
      const data = await getConstantsDB();

      if (!data) {
        logger.warn("No data found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      console.log(data);

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error(error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createConstants(data: any) {
    try {
      const response = await validateType(data, ConstantSchema);

      if (response instanceof ZodError) {
        logger.warn("Incorrect Data: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const createdConstants = await createConstantsDB(response);
      return {
        success: true,
        data: {
          tax: createdConstants?.tax || null,
          service: createdConstants?.service || null,
        },
      };
    } catch (error) {
      logger.error(error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateConstants(data: any) {
    try {
      const response = await validateType(data, ConstantSchema);

      if (response instanceof ZodError) {
        logger.warn("Incorrect Data: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      if (response.service?.id || response.tax?.id) {
        logger.warn("Missing IDs: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const updatedConstants = await updateConstantsDB(response);
      return {
        success: true,
        data: {
          tax: updatedConstants?.tax || null,
          service: updatedConstants?.service || null,
        },
      };
    } catch (error) {
      logger.error(error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteConstants(data: any) {
    try {
      const response = await validateType(data, ConstantSchema);

      if (response instanceof ZodError) {
        logger.warn("Incorrect Data or Missing IDs: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      if (!response?.service?.id || !response?.tax?.id) {
        logger.warn("Missing IDs: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      console.log(data);
      const deletedConstants = await deleteConstantsDB(response);
      return {
        success: true,
        data: {
          tax: deletedConstants?.tax || null,
          service: deletedConstants?.service || null,
        },
      };
    } catch (error) {
      logger.error(error);
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
