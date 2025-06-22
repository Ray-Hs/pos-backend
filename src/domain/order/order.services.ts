import { z, ZodError } from "zod";
import prisma from "../../infrastructure/database/prisma/client";
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
import { getConstantsDB } from "../constants/constants.repository";
import { calculateTotal, updateInvoiceDB } from "../invoice/invoice.repository";
import {
  createOrderDB,
  deleteOrderDB,
  findOrderByIdDB,
  findOrderByTableIdDB,
  getLatestOrderDB,
  getOrdersDB,
  updateOrderDB,
} from "./order.repository";
import { OrderServiceInterface } from "./order.types";

export class OrderServices implements OrderServiceInterface {
  async getOrders() {
    try {
      const data = await getOrdersDB();
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
      const response = await validateType(
        { id: requestId },
        OrderSchema.pick({ id: true })
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

      const data = await findOrderByIdDB(response.id, prisma);
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
  async getLatestOrder(requestId: number) {
    try {
      const tableId = await validateType(
        { id: requestId },
        OrderSchema.pick({ id: true })
      );

      if (tableId instanceof ZodError || !tableId.id) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const data = await getLatestOrderDB(tableId.id);
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
      logger.error("Get Latest Order Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getOrderByTableId(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        OrderSchema.pick({ id: true })
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

      const data = await findOrderByTableIdDB(response.id);
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

      const createdOrder = await createOrderDB(data);

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
      const response = await validateType(
        { id: requestId },
        OrderSchema.pick({ id: true })
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

      const data = await validateType(
        requestData,
        OrderSchema.extend({ invoiceId: z.number() })
      );
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

      const updatedOrder = await prisma.$transaction(async (tx) => {
        const { items, userId, reason, invoiceId, ...rest } = data;
        const prev_order = await findOrderByIdDB(response.id as number, tx);
        const order_items = prev_order?.items;
        if (!prev_order) {
          throw new Error("No Previous Order");
        }
        const deletedItems = order_items?.filter(
          (orderItem) => !items.some((item) => item.id === orderItem.id)
        );
        const addedItems = items.filter(
          (item) => !order_items?.some((orderItem) => orderItem.id === item.id)
        );

        if (deletedItems && deletedItems.length > 0) {
          // First, delete the order items to avoid violating required relation
          await tx.orderItem.deleteMany({
            where: {
              id: {
                in: deletedItems?.map((item) => item.id),
              },
            },
          });
          // Then, create deletedOrderItems for audit/history
          await tx.deletedOrderItem.createMany({
            data: deletedItems.map((item) => ({
              orderId: response.id as number,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes ?? null,
              invoiceId,
              sortOrder: item.sortOrder ?? undefined,
              createdAt: item.createdAt ?? undefined,
              reason: data.reason || "", // or another appropriate reason
            })),
          });

          const order = await updateOrderDB(response?.id as number, data, tx);
          const constants = await getConstantsDB(tx);
          const subtotal = order.items.reduce(
            (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
            0
          );
          const total = calculateTotal(subtotal, constants);
          const invoiceRef = order.Invoice[0].id;
          const invoicesFromRef = await tx.invoice.findMany({
            where: {
              invoiceRefId: invoiceRef,
            },
          });
          const version = Math.max(
            ...invoicesFromRef.map((invoice) => invoice.version)
          );
          //? Update old Invoice version Status
          await updateInvoiceDB(
            invoiceId,
            {
              isLatestVersion: false,
            },
            tx
          );
          //? Create new invoice and assign it into invoiceRef
          const invoice = await tx.invoice.create({
            data: {
              subtotal,
              total,
              version: version + 1,
              invoiceRefId: invoiceRef,
              userId: order.userId,
              isLatestVersion: true,
              serviceId: constants.service?.id,
              taxId: constants.tax?.id,
              tableId: order.tableId,
            },
          });
          return { order, invoice };
        }
      });

      const existingOrder = await findOrderByIdDB(response.id, prisma);
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

      return {
        success: true,
        data: updatedOrder,
      };
    } catch (error) {
      logger.error("Update Order Service: ", error);
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
      const response = await validateType(
        { id: requestId },
        OrderSchema.pick({ id: true })
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

      const existingOrder = await findOrderByIdDB(response.id, prisma);
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

      const deletedOrder = await deleteOrderDB(response.id);

      return {
        success: true,
        message: "Deleted Order Successfully",
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
