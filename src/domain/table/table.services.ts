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
import { TableSchema } from "../../types/common";
import {
  createTableDB,
  deleteTableDB,
  findTableByIdDB,
  getTablesDB,
  updateTableDB,
} from "./table.repository";
import { TableServiceInterface } from "./table.types";

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
      const id = (
        await validateType({ id: requestId }, TableSchema.pick({ id: true }))
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

      const data = await findTableByIdDB(id);

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

  async createTable(requestData: any) {
    try {
      const data = await validateType(requestData, TableSchema);
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

      const createdTable = await createTableDB(data);
      return {
        success: true,
        data: createdTable,
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
      const id = (
        await validateType({ id: requestId }, TableSchema.pick({ id: true }))
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
      const data = await validateType(requestData, TableSchema);
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

      const existingTable = await findTableByIdDB(id);
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

      const updatedTable = await updateTableDB(id, data);
      return {
        success: true,
        data: updatedTable,
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
      const id = (
        await validateType({ id: requestId }, TableSchema.pick({ id: true }))
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
      const existingTable = await findTableByIdDB(id);
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

      const deletedTable = await deleteTableDB(id);
      return {
        success: true,
        data: deletedTable,
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
}
