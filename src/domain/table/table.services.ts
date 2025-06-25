import { ZodError } from "zod";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import { TableSchema, TResult } from "../../types/common";
import {
  createTableDB,
  deleteTableDB,
  findTableByIdDB,
  findTableByNameDB,
  getTablesDB,
  transferTableDB,
  updateTableDB,
} from "./table.repository";
import { TableServiceInterface } from "./table.types";
import prisma from "../../infrastructure/database/prisma/client";

export class TableServices implements TableServiceInterface {
  async getTables() {
    try {
      const data = await getTablesDB();
      if (!data || data.length === 0) {
        logger.warn("Not Data Found");
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
      logger.error("Get Tables Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getTableById(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        TableSchema.pick({ id: true })
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

      const data = await findTableByIdDB(response.id);

      if (!data) {
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
        data,
      };
    } catch (error) {
      logger.error("Get Tables By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async getTableByName(requestName: any) {
    try {
      const response = await validateType(
        { name: requestName },
        TableSchema.pick({ name: true })
      );
      if (response instanceof ZodError || !response.name) {
        logger.warn("Missing Name");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ERR,
          },
        };
      }

      const data = await findTableByNameDB(response.name);

      if (!data) {
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
        data,
      };
    } catch (error) {
      logger.error("Get Tables By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createTable(requestData: any, quantity: number, sectionId: number) {
    try {
      const data = await validateType(requestData, TableSchema);
      if (data instanceof ZodError) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const createdTable = await createTableDB(data, quantity, sectionId);
      return {
        success: true,
      };
    } catch (error) {
      logger.error("Get Tables By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async updateTable(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        TableSchema.pick({ id: true })
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
      const data = await validateType(requestData, TableSchema);
      if (data instanceof ZodError) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const existingTable = await findTableByIdDB(response.id);
      if (!existingTable) {
        logger.error("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const updatedTable = await updateTableDB(response.id, data, prisma);
      return {
        success: true,
        message: "Updated Table Successfully",
      };
    } catch (error) {
      logger.error("Update Table Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteTable(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        TableSchema.pick({ id: true })
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
      const existingTable = await findTableByIdDB(response.id);

      if (!existingTable) {
        logger.warn("Table Doesn't exist");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      if (existingTable?.status !== "AVAILABLE") {
        logger.warn("Can not delete an occupied table.");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Can not delete an occupied table.",
          },
        };
      }

      const deletedTable = await deleteTableDB(response.id);
      return {
        success: true,
        message: "Deleted Successfully",
      };
    } catch (error) {
      logger.error("Delete Table Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async transferTable(tableIdOne: number, tableIdTwo: number) {
    try {
      const data = await transferTableDB(tableIdOne, tableIdTwo);

      if (!data?.success && data.code) {
        return {
          success: false,
          error: {
            code: data.code,
            message: data.message,
          },
        };
      }

      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      logger.error("Transfer Table Service: ", error);
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
