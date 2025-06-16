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
  createSupplyDB,
  deleteSupplyDB,
  getSuppliesDB,
  getSupplyByIdDB,
  updateSupplyDB,
} from "./supply.repository";
import { Supply, SupplySchema, SupplyServiceInterface } from "./supply.types";

export class SupplyServices implements SupplyServiceInterface {
  async getSupplies() {
    try {
      const data = await getSuppliesDB();
      if (!data) {
        logger.warn("Supplies Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Supplies: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getSupplyById(requestId: any) {
    try {
      const validated = await validateType(
        { id: requestId },
        SupplySchema.pick({ id: true })
      );
      if (!validated || validated instanceof ZodError || !validated.id) {
        logger.warn("Type Error: ", validated);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await getSupplyByIdDB(validated.id);
      if (!data) {
        logger.warn("Supply Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return { success: true, data };
    } catch (error) {
      logger.error("Get Supply By Id: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createSupply(requestData: any) {
    try {
      const data = await validateType(requestData, SupplySchema);
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
      await createSupplyDB(data);
      return {
        success: true,
        message: "Created Supply Successfully",
      };
    } catch (error) {
      logger.error("Create Supply: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateSupply(requestData: any, requestId: any) {
    try {
      const data = await validateType(requestData, SupplySchema);
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
        SupplySchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await updateSupplyDB(data, id.id);
      return {
        success: true,
        message: "Updated Supply Successfully",
      };
    } catch (error) {
      logger.error("Update Supply: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteSupply(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        SupplySchema.pick({ id: true })
      );
      if (!id || id instanceof ZodError || !id.id) {
        logger.warn("Type Error: ", id);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      await deleteSupplyDB(id.id);
      return {
        success: true,
        message: "Deleted Supply Successfully",
      };
    } catch (error) {
      logger.error("Delete Supply: ", error);
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
