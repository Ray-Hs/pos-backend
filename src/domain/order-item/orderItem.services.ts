import { ZodError } from "zod";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
  OK_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import { TResult, OrderItem, OrderItemSchema } from "../../types/common";
import {
  createOrderItemDB,
  deleteOrderItemDB,
  getOrderItemByIdDB,
  getOrderItemsDB,
  updateOrderItemDB,
} from "./orderItem.repository";
import { OrderItemServiceInterface } from "./orderItem.types";

export class OrderItemServices implements OrderItemServiceInterface {
  async getOrderItems() {
    try {
      const data = await getOrderItemsDB();

      if (!data || data.length === 0) {
        logger.warn("No Order Items Data Found");
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

  async getOrderItemById(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        OrderItemSchema.pick({ id: true })
      );

      if (id instanceof ZodError || !id?.id) {
        logger.warn("No ID Provided please check the id and try again");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const data = await getOrderItemByIdDB(id.id);

      if (!data) {
        logger.warn("No Order Item Found OR Empty");
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

  async createOrderItem(requestData: any) {
    try {
      const data = await validateType(requestData, OrderItemSchema);

      if (data instanceof ZodError) {
        logger.warn("Type of data doesn't match Order Item Schema");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const createdOrderItem = await createOrderItemDB(data);

      return {
        success: true,
        data: createdOrderItem,
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
  async updateOrderItem(requestId: any, requestData: any) {
    try {
      const id = await validateType(
        { id: requestId },
        OrderItemSchema.pick({ id: true })
      );

      if (id instanceof ZodError || !id?.id) {
        logger.warn("No ID Provided please check the id and try again");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const data = await validateType(requestData, OrderItemSchema);

      if (data instanceof ZodError) {
        logger.warn("Type of data doesn't match Order Item Schema");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const updatedData = await updateOrderItemDB(id.id, data);

      return {
        success: true,
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

  async deleteOrderItem(requestId: any) {
    try {
      const id = await validateType(
        { id: requestId },
        OrderItemSchema.pick({ id: true })
      );

      if (id instanceof ZodError || !id?.id) {
        logger.warn("No ID Provided please check the id and try again");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const deletedData = await deleteOrderItemDB(id.id);
      return {
        success: true,
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
