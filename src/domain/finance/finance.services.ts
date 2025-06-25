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
  createCompanyDebtDB,
  deleteCompanyDebtDB,
  findCompanyDebtByIdDB,
  getCompanyDebtsDB,
  updateCompanyDebtDB,
} from "./finance.repository"; // adjust import path as needed
import { CompanyDebtSchema, FinanceServiceInterface } from "./finance.types";

export class FinanceServices implements FinanceServiceInterface {
  async listCompanyDebts() {
    try {
      const data = await getCompanyDebtsDB();
      if (!data) {
        logger.warn("No Company Debts found.");
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
      logger.error("Get Finances Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getCompanyDebtById(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
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
      const data = await findCompanyDebtByIdDB(response.id);
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
      logger.error("Get Finance By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  // getFinanceByName left as is, since no DB function provided

  async createCompanyDebt(requestData: any) {
    try {
      const data = await validateType(requestData, CompanyDebtSchema);
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
      await createCompanyDebtDB(data);
      return {
        success: true,
      };
    } catch (error) {
      logger.error("Create Finance Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateCompanyDebt(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
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
      const data = await validateType(requestData, CompanyDebtSchema);
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
      const existingFinance = await findCompanyDebtByIdDB(response.id);
      if (!existingFinance) {
        logger.error("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      await updateCompanyDebtDB(response.id, data);
      return {
        success: true,
        message: "Updated Finance Successfully",
      };
    } catch (error) {
      logger.error("Update Finance Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteCompanyDebt(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        CompanyDebtSchema.pick({ id: true })
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
      const existingFinance = await findCompanyDebtByIdDB(response.id);
      if (!existingFinance) {
        logger.warn("Finance Doesn't exist");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      await deleteCompanyDebtDB(response.id);
      return {
        success: true,
        message: "Deleted Successfully",
      };
    } catch (error) {
      logger.error("Delete Finance Service: ", error);
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
