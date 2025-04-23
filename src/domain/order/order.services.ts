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
import { OrderSchema } from "../../types/common";
import {
  createOrderDB,
  deleteOrderDB,
  findOrderByIdDB,
  getOrdersDB,
  updateOrderDB,
} from "./order.repository";
import { OrderServiceInterface } from "./order.types";

export class OrderServices implements OrderServiceInterface {
  async getOrders() {
    try {
      const data = await getOrdersDB({
        items: true,
        table: true,
        user: true,
        _count: {
          select: {
            items: true,
            Invoice: true,
          },
        },
      });
      if (!data || data.length === 0) {
        logger.warn("No Data Found");
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
      logger.error("Get Orders Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getOrderById(requestId: any) {
    try {
      const id = (
        await validateType({ id: requestId }, OrderSchema.pick({ id: true }))
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

      const data = await findOrderByIdDB(id, {
        items: true,
        table: true,
        user: true,
        _count: {
          select: {
            items: true,
            Invoice: true,
          },
        },
      });
      if (!data) {
        logger.warn("No Data Found");
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
      logger.error("Get Order By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async createOrder(requestData: any) {
    try {
      const data = await validateType(requestData, OrderSchema);
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

      const createdOrder = await createOrderDB(data, {
        items: true,
        table: true,
        user: true,
        _count: {
          select: {
            items: true,
            Invoice: true,
          },
        },
      });
      return {
        success: true,
        data: createdOrder,
      };
    } catch (error) {
      logger.error("Create Order Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateOrder(requestId: any, requestData: any) {
    try {
      const id = (
        await validateType({ id: requestId }, OrderSchema.pick({ id: true }))
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

      const data = await validateType(requestData, OrderSchema);
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

      const existingOrder = await findOrderByIdDB(id);
      if (!existingOrder) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const updatedOrder = await updateOrderDB(id, data, {
        items: true,
        table: true,
        user: true,
        _count: {
          select: {
            items: true,
            Invoice: true,
          },
        },
      });
      return {
        success: true,
        data: updatedOrder,
      };
    } catch (error) {
      logger.error("Create Order Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async deleteOrder(requestId: any) {
    try {
      const id = (
        await validateType({ id: requestId }, OrderSchema.pick({ id: true }))
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

      const existingOrder = await findOrderByIdDB(id);
      if (!existingOrder) {
        logger.warn("Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const deletedOrder = await deleteOrderDB(id, {
        items: true,
        table: true,
        user: true,
        _count: {
          select: {
            items: true,
            Invoice: true,
          },
        },
      });

      return {
        success: true,
        data: deletedOrder,
      };
    } catch (error) {
      logger.error("Create Order Service: ", error);
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
