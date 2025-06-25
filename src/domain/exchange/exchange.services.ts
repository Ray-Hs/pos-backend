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
import { TResult } from "../../types/common";
import {
  createExchangeRate,
  getExchangeRates,
  getLatestExchangeRate,
} from "./exchange.repository";
import {
  ExchangeRate,
  ExchangeRateSchema,
  ExchangeRateServiceInterface,
} from "./exchange.types";

export class ExchangeRateServices implements ExchangeRateServiceInterface {
  async getExchangeRates() {
    try {
      const data = await getExchangeRates();

      if (!data) {
        logger.warn("No Exchange data found.");
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
      logger.error("Get Exchange Rates: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getLatestExchangeRate() {
    try {
      const data = await getLatestExchangeRate();

      if (!data) {
        logger.warn("No Latest Exchange data found.");
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
      logger.error("Get Latest Exchange Rate: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async createExchangeRate(data: any) {
    try {
      const response = await validateType(data, ExchangeRateSchema);

      if (response instanceof ZodError || !response) {
        logger.warn("Missing or malformed data");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const createdExchangeRate = await createExchangeRate(response);
      return {
        success: true,
        message: "Created Exchange Rate successfully.",
      };
    } catch (error) {
      logger.error("Get Latest Exchange Rate: ", error);
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
