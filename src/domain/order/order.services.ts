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
import { calculateTotal } from "../invoice/invoice.repository";
import { printerService } from "../settings/printers/printer.services";
import {
  cancelOrderDB,
  createOrderDB,
  deleteOrderDB,
  findOrderByIdDB,
  findOrderByTableIdDB,
  getLatestOrderDB,
  getOrdersDB,
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
      console.log("Order Data: ", data);

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

      const updatedOrder = await prisma.$transaction(async (tx) => {
        const { items, userId, reason, invoiceId, ...rest } = data;
        console.log("Data: ", data);
        const order_items = existingOrder?.items;

        if (!existingOrder) {
          throw new Error("No Previous Order");
        }

        const deletedItems = order_items?.filter(
          (orderItem) => !items.some((item) => item.id === orderItem.id)
        );
        const addedItems = items.filter(
          (item) => !order_items?.some((orderItem) => orderItem.id === item.id)
        );
        const existingItems = items.filter((item) =>
          order_items?.some((orderItem) => orderItem.id === item.id)
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
          const deletedItemsCreated = await tx.deletedOrderItem.createMany({
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

          // Calculate quantities of deleted items by menu item name
          const deletedItemMap = new Map<string, number>();
          for (const orderItem of deletedItems) {
            const name = orderItem.menuItem?.title_en?.toLowerCase();
            if (!name) continue;
            const prevQty = deletedItemMap.get(name) ?? 0;
            deletedItemMap.set(name, prevQty + (orderItem.quantity ?? 0));
          }

          // Add back the deleted item quantities to supplies
          await Promise.all(
            Array.from(deletedItemMap.entries()).map(
              async ([name, qtyToAdd]) => {
                const supplies = await tx.supply.findMany({
                  where: {
                    name: {
                      equals: name,
                      mode: "insensitive",
                    },
                  },
                  orderBy: {
                    remainingQuantity: "asc", // Start with lowest quantities first
                  },
                });

                if (supplies.length > 0) {
                  // Add all quantity back to the first supply (or distribute if needed)
                  const firstSupply = supplies[0];
                  await tx.supply.update({
                    where: { id: firstSupply.id },
                    data: {
                      remainingQuantity:
                        (firstSupply.remainingQuantity || 0) + qtyToAdd,
                    },
                  });
                }
              }
            )
          );
        }

        // Handle item updates separately
        const itemsUpdate: any = {};

        // Create new items if there are any
        if (addedItems && addedItems.length > 0) {
          itemsUpdate.create = addedItems.map((item) => ({
            menuItemId: item.menuItemId,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes,
          }));
        }

        // Update existing items if there are any
        if (existingItems && existingItems.length > 0) {
          itemsUpdate.update = existingItems.map((item) => ({
            where: { id: item.id },
            data: {
              menuItemId: item.menuItemId,
              price: item.price,
              quantity: item.quantity,
              notes: item.notes,
            },
          }));
        }

        if (!existingOrder) {
          throw new Error("Order not found");
        }

        const menuItems = await Promise.all(
          items.map((item) => {
            return tx.menuItem.findFirst({
              where: {
                id: item.menuItemId,
              },
            });
          })
        );

        // Calculate old quantities by menu item name
        const oldItemMap = new Map<string, number>();
        for (const orderItem of existingOrder.items) {
          const name = orderItem.menuItem?.title_en?.toLowerCase();
          if (!name) continue;
          const prevQty = oldItemMap.get(name) ?? 0;
          oldItemMap.set(name, prevQty + (orderItem.quantity ?? 0)); // Use actual quantity
        }

        // Calculate new quantities by menu item name
        const newItemMap = new Map<string, number>();
        for (let i = 0; i < items.length; i++) {
          const orderItem = items[i]; // Use the order item, not menu item
          const menuItem = menuItems[i];
          const name = menuItem?.title_en?.toLowerCase();
          if (!name) continue;
          const prevQty = newItemMap.get(name) ?? 0;
          newItemMap.set(name, prevQty + (orderItem.quantity ?? 0)); // Use actual quantity
        }

        // Calculate the difference and update supplies
        const allItemNames = new Set([
          ...oldItemMap.keys(),
          ...newItemMap.keys(),
        ]);

        const supplies = await Promise.all(
          Array.from(allItemNames).map(async (name) => {
            const oldQty = oldItemMap.get(name) ?? 0;
            const newQty = newItemMap.get(name) ?? 0;
            const qtyDifference = newQty - oldQty;

            if (qtyDifference === 0) return null;

            // Find all supplies with the same name, ordered by remaining quantity (highest first)
            const allSupplies = await tx.supply.findMany({
              where: {
                name: {
                  equals: name,
                  mode: "insensitive",
                },
              },
              orderBy: {
                remainingQuantity: "desc",
              },
            });

            if (allSupplies.length === 0) return null;

            let remainingToDeduct = qtyDifference;

            // Process each supply in order
            for (const supply of allSupplies) {
              if (remainingToDeduct <= 0) break;

              const currentRemaining = supply.remainingQuantity || 0;
              const newRemainingQty = currentRemaining - remainingToDeduct;

              if (newRemainingQty >= 0) {
                // This supply can handle the remaining deduction
                await tx.supply.update({
                  where: { id: supply.id },
                  data: {
                    remainingQuantity: newRemainingQty,
                  },
                });
                remainingToDeduct = 0;
              } else {
                // This supply will go to zero, deduct what we can
                const canDeduct = currentRemaining;
                if (canDeduct > 0) {
                  await tx.supply.update({
                    where: { id: supply.id },
                    data: {
                      remainingQuantity: 0,
                    },
                  });
                  remainingToDeduct -= canDeduct;
                }
              }
            }

            // If remainingToDeduct > 0 here, it means we couldn't fulfill the full order
            // but we proceed anyway as requested

            return allSupplies;
          })
        );

        const order = await tx.order.update({
          where: {
            id: response.id,
          },
          data: {
            ...rest,
            userId,
            items: itemsUpdate,
          },
          include: {
            user: true,
            items: true,
            Invoice: {
              orderBy: { createdAt: "desc" },
            },
          },
        });

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
        await tx.invoice.update({
          where: {
            id: invoiceId,
          },
          data: {
            isLatestVersion: false,
          },
        });
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
      });

      if (!updatedOrder) {
        logger.warn("No items were deleted, nothing to update.");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "No items were deleted, nothing to update.",
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

  async cancelOrder(tableId: any) {
    try {
      const response = await validateType(
        { tableId: tableId },
        OrderSchema.pick({ tableId: true })
      );
      if (response instanceof ZodError || !response.tableId) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const existingOrder = await findOrderByIdDB(response.tableId, prisma);
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

      const canceledOrder = await cancelOrderDB(response.tableId);

      return {
        success: true,
        message: "Canceled Order Successfully",
      };
    } catch (error) {
      logger.error("Cancel Order Service: ", error);
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
