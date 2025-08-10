import fs from "fs";
import { PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import path from "path";
import puppeteer from "puppeteer";
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
import { OrderSchema, User, UserSchema } from "../../types/common";
import { getConstantsDB } from "../constants/constants.repository";
import { calculateTotal } from "../invoice/invoice.repository";
import {
  createOrderDB,
  deleteOrderDB,
  findOrderByIdDB,
  findOrderByTableIdDB,
  getLatestOrderDB,
  getOrdersDB,
} from "./order.repository";
import { OrderServiceInterface } from "./order.types";
import { findTableByIdDB } from "../table/table.repository";

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
    const startTime = Date.now();
    try {
      // Validate request ID
      const response = await validateType(
        { id: requestId },
        OrderSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      // Validate request data
      const data = await validateType(
        requestData,
        OrderSchema.extend({ invoiceId: z.number() })
      );
      if (data instanceof ZodError) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      // Find existing order
      const existingOrder = await findOrderByIdDB(response.id, prisma);
      if (!existingOrder) {
        logger.error("Order not found in database", { orderId: response.id });
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      logger.db("transaction", { phase: "START" });
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const transactionStartTime = Date.now();

        const { items, userId, reason, invoiceId, ...rest } = data;

        const order_items = existingOrder?.items;
        if (!existingOrder) {
          logger.error("No existing order in transaction", {
            orderId: response.id,
          });
          throw new Error("No Previous Order");
        }

        // Calculate item differences
        const deletedItems = order_items?.filter(
          (orderItem) => !items.some((item) => item.id === orderItem.id)
        );
        const addedItems = items.filter(
          (item) => !order_items?.some((orderItem) => orderItem.id === item.id)
        );
        const existingItems = items.filter((item) =>
          order_items?.some((orderItem) => orderItem.id === item.id)
        );

        // Handle deleted items
        if (deletedItems && deletedItems.length > 0) {
          // Delete order items
          await tx.orderItem.deleteMany({
            where: {
              id: {
                in: deletedItems?.map((item) => item.id),
              },
            },
          });

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
              reason: data.reason || "",
            })),
          });

          // Calculate quantities to add back to supplies
          const deletedItemMap = new Map<string, number>();
          for (const orderItem of deletedItems) {
            const name = orderItem.menuItem?.title_en?.toLowerCase();
            if (!name) {
              logger.warn("Deleted item missing menu item title", {
                orderItemId: orderItem.id,
                menuItemId: orderItem.menuItemId,
              });
              continue;
            }
            const prevQty = deletedItemMap.get(name) ?? 0;
            deletedItemMap.set(name, prevQty + (orderItem.quantity ?? 1));
          }

          // Add back quantities to supplies
          const supplyRestoreStartTime = Date.now();
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
                    remainingQuantity: "asc",
                  },
                });

                if (supplies.length > 0) {
                  const firstSupply = supplies[0];
                  const newQuantity =
                    (firstSupply.remainingQuantity || 0) + qtyToAdd;

                  await tx.supply.update({
                    where: { id: firstSupply.id },
                    data: {
                      remainingQuantity: newQuantity,
                    },
                  });
                } else {
                  logger.warn("No supplies found for restoration", {
                    itemName: name,
                  });
                }
              }
            )
          );
        }

        // Prepare items update object
        const itemsUpdate: any = {};

        // Handle added items
        if (addedItems && addedItems.length > 0) {
          itemsUpdate.create = addedItems.map((item) => ({
            menuItemId: item.menuItemId,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes,
          }));
        }

        // Handle existing items updates
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

        // Fetch menu items for supply calculations
        const menuItemsStartTime = Date.now();
        logger.db("menuItem.findFirst", { itemCount: items.length });
        const menuItems = await Promise.all(
          items.map((item) => {
            return tx.menuItem.findFirst({
              where: {
                id: item.menuItemId,
              },
            });
          })
        );
        logger.perf("Fetch menu items", Date.now() - menuItemsStartTime, {
          count: menuItems.length,
          menuItems: menuItems.map((mi) => ({
            id: mi?.id,
            title: mi?.title_en,
          })),
        });

        // Calculate old quantities by menu item name
        logger.debug("Calculating old item quantities");
        const oldItemMap = new Map<string, number>();
        for (const orderItem of existingOrder.items) {
          const name = orderItem.menuItem?.title_en?.toLowerCase();
          if (!name) {
            logger.warn("Order item missing menu item title", {
              orderItemId: orderItem.id,
              menuItemId: orderItem.menuItemId,
            });
            continue;
          }
          const prevQty = oldItemMap.get(name) ?? 0;
          oldItemMap.set(name, prevQty + (orderItem.quantity ?? 0));
        }
        logger.debug("Old quantities calculated", {
          oldItemMap: Object.fromEntries(oldItemMap),
        });

        // Calculate new quantities by menu item name
        logger.debug("Calculating new item quantities");
        const newItemMap = new Map<string, number>();
        for (let i = 0; i < items.length; i++) {
          const orderItem = items[i];
          const menuItem = menuItems[i];
          const name = menuItem?.title_en?.toLowerCase();
          if (!name) {
            logger.warn("Menu item missing title", {
              menuItemId: menuItem?.id,
              orderItemIndex: i,
              orderItemMenuItemId: orderItem.menuItemId,
            });
            continue;
          }
          const prevQty = newItemMap.get(name) ?? 0;
          newItemMap.set(name, prevQty + (orderItem.quantity ?? 0));
        }
        logger.debug("New quantities calculated", {
          newItemMap: Object.fromEntries(newItemMap),
        });

        // Calculate differences and update supplies
        const allItemNames = new Set([
          ...oldItemMap.keys(),
          ...newItemMap.keys(),
        ]);
        logger.info("Processing supply updates", {
          itemNames: Array.from(allItemNames),
        });

        const supplyUpdateStartTime = Date.now();
        const supplies = await Promise.all(
          Array.from(allItemNames).map(async (name) => {
            const oldQty = oldItemMap.get(name) ?? 0;
            const newQty = newItemMap.get(name) ?? 0;
            const qtyDifference = newQty - oldQty;

            logger.debug("Processing item supply update", {
              itemName: name,
              oldQty,
              newQty,
              qtyDifference,
            });

            if (qtyDifference === 0) {
              logger.debug("No quantity change for item", { itemName: name });
              return null;
            }

            // Find supplies for this item
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

            logger.debug("Found supplies for item", {
              itemName: name,
              suppliesCount: allSupplies.length,
              supplies: allSupplies.map((s) => ({
                id: s.id,
                remainingQuantity: s.remainingQuantity,
              })),
            });

            if (allSupplies.length === 0) {
              logger.warn("No supplies found for item", { itemName: name });
              return null;
            }

            let remainingToDeduct = qtyDifference;
            logger.debug("Starting supply deduction process", {
              itemName: name,
              totalToDeduct: remainingToDeduct,
            });

            // Process each supply in order
            for (const supply of allSupplies) {
              if (remainingToDeduct <= 0) break;

              const currentRemaining = supply.remainingQuantity || 0;
              const newRemainingQty = currentRemaining - remainingToDeduct;

              logger.debug("Processing individual supply", {
                supplyId: supply.id,
                currentRemaining,
                remainingToDeduct,
                calculatedNewQty: newRemainingQty,
              });

              if (newRemainingQty >= 0) {
                // This supply can handle the remaining deduction
                await tx.supply.update({
                  where: { id: supply.id },
                  data: {
                    remainingQuantity: newRemainingQty,
                  },
                });
                logger.debug("Supply fully satisfied deduction", {
                  supplyId: supply.id,
                  oldQuantity: currentRemaining,
                  newQuantity: newRemainingQty,
                  deducted: remainingToDeduct,
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
                  logger.debug("Supply partially satisfied deduction", {
                    supplyId: supply.id,
                    oldQuantity: currentRemaining,
                    newQuantity: 0,
                    deducted: canDeduct,
                    stillNeedToDeduct: remainingToDeduct,
                  });
                }
              }
            }

            if (remainingToDeduct > 0) {
              logger.warn("Could not fully satisfy supply deduction", {
                itemName: name,
                unsatisfiedQuantity: remainingToDeduct,
              });
            }

            return allSupplies;
          })
        );
        logger.perf("Supply updates", Date.now() - supplyUpdateStartTime);

        // Update the order
        const orderUpdateStartTime = Date.now();
        logger.db("order.update", { orderId: response.id });
        const order = await tx.order.update({
          where: {
            id: response.id,
          },
          data: {
            ...rest,
            userId,
            items: itemsUpdate,
            tableId: data.tableId,
          },
          include: {
            user: true,
            items: true,
            Invoice: {
              include: {
                invoices: {
                  select: {
                    customerDiscount: {
                      select: {
                        discount: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
        if (data.tableId) {
          await tx.table.update({
            where: {
              id: data.tableId,
            },
            data: {
              status: "OCCUPIED",
            },
          });
        }

        // Calculate totals and create new invoice
        const constants = await getConstantsDB(tx);
        const subtotal = order.items.reduce(
          (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
          0
        );

        logger.info(
          order.Invoice?.[0].invoices?.[0].customerDiscount?.discount
        );

        const total = calculateTotal(
          subtotal,
          constants,
          order.Invoice?.[0].invoices?.[0].customerDiscount?.discount
        );

        const invoiceRef = order.Invoice[0].id;
        const invoicesFromRef = await tx.invoice.findMany({
          where: {
            invoiceRefId: invoiceRef,
          },
        });

        const version = Math.max(
          ...invoicesFromRef.map((invoice) => invoice.version)
        );

        // Update old invoice version status
        await tx.invoice.update({
          where: {
            id: invoiceId,
          },
          data: {
            isLatestVersion: false,
          },
        });

        // Create new invoice
        const invoiceCreateStartTime = Date.now();
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
        logger.warn("Transaction returned null - no updates made");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "No items were deleted, nothing to update.",
          },
        };
      }

      const totalTime = Date.now() - startTime;
      logger.perf("updateOrder", totalTime, {
        orderId: updatedOrder.order.id,
        finalItemsCount: updatedOrder.order.items?.length,
        newInvoiceId: updatedOrder.invoice.id,
        newInvoiceVersion: updatedOrder.invoice.version,
      });

      logger.trace("updateOrder", "EXIT", { success: true });
      return {
        success: true,
        data: updatedOrder,
      };
    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      logger.error("updateOrder failed", {
        error: error.message,
        stack: error.stack,
        requestId,
        requestData,
        executionTime: totalTime,
      });
      logger.trace("updateOrder", "EXIT", { success: false });
      
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

  async cancelOrder(
    tableId: any,
    user: Partial<User>,
    cancellationReason: string
  ) {
    try {
      // Validate input data
      const validationResult = this.validateCancelOrderInput(
        tableId,
        user,
        cancellationReason
      );
      if (!validationResult.success) {
        return validationResult;
      }
      const { data } = validationResult;

      // Get and validate the latest order
      const orderResult = await this.getLatestOrderForCancellation(
        data?.tableId as number
      );
      if (!orderResult.success) {
        return orderResult;
      }
      const { latestOrder } = orderResult;

      // Validate table status
      const tableValidationResult = await this.validateTableForCancellation(
        data?.tableId as number
      );
      if (!tableValidationResult.success) {
        return tableValidationResult;
      }

      // Update database records
      const dbUpdateResult = await this.updateDatabaseForCancellation(
        latestOrder,
        data
      );
      if (!dbUpdateResult.success) {
        return dbUpdateResult;
      }

      // Print cancellation receipts
      const printResult = await this.printCancellationReceipts(
        latestOrder,
        data
      );

      return {
        success: printResult.success,
        details: printResult.details,
        cancelledOrder: latestOrder,
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

  private validateCancelOrderInput(
    tableId: any,
    user: Partial<User>,
    cancellationReason: string
  ) {
    const schema = z.object({
      user: UserSchema,
      tableId: z.number(),
      cancellationReason: z.string().optional(),
    });

    try {
      const data = schema.parse({ tableId, user, cancellationReason });
      return { success: true, data };
    } catch (err) {
      logger.warn("Invalid Cancel Latest Order Data:", err);
      return {
        success: false,
        error: { code: BAD_REQUEST_STATUS, message: BAD_REQUEST_BODY_ERR },
      };
    }
  }

  private async getLatestOrderForCancellation(tableId: number) {
    const latestOrder = await prisma.order.findFirst({
      where: { tableId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                Printer: true,
              },
            },
          },
        },
        table: true,
      },
    });

    if (!latestOrder) {
      logger.warn(`No active order found for table ${tableId}`);
      return {
        success: false,
        error: { code: 404, message: "No active order found for this table" },
      };
    }

    if (latestOrder.items.length === 0) {
      logger.warn(`Order ${latestOrder.id} has no items to cancel`);
      return {
        success: false,
        error: { code: 400, message: "Order has no items to cancel" },
      };
    }

    return { success: true, latestOrder };
  }

  private async validateTableForCancellation(tableId: number) {
    const table = await findTableByIdDB(tableId);

    if (table?.status !== "OCCUPIED") {
      return {
        success: false,
        error: {
          code: 400,
          message: "Can not cancel receipted/available orders.",
        },
      };
    }

    return { success: true };
  }

  private async updateDatabaseForCancellation(latestOrder: any, data: any) {
    try {
      return await prisma.$transaction(async (tx) => {
        // First, update supply quantities by adding back the canceled order quantities
        await this.updateSupplyQuantities(tx, latestOrder);

        // Update table status
        await tx.table.update({
          where: { id: latestOrder.tableId || 0 },
          data: {
            orders: {
              disconnect: { id: latestOrder.id },
            },
            status: "AVAILABLE",
          },
        });

        // Update order status to CANCELLED
        await tx.order.update({
          where: { id: latestOrder.id },
          data: {
            cancelledAt: new Date(),
            userId: data.user.id,
            cancellationReason: data.cancellationReason,
          },
        });

        logger.info(`Order ${latestOrder.id} marked as cancelled in database`);
        return { success: true };
      });
    } catch (err) {
      logger.error(`Failed to update order ${latestOrder.id} status:`, err);
      return {
        success: false,
        error: { code: 500, message: "Failed to update order status" },
      };
    }
  }

  private async printCancellationReceipts(latestOrder: any, data: any) {
    // Group items by printer IP
    const itemsByPrinter = this.groupItemsByPrinter(latestOrder.items);

    if (Object.keys(itemsByPrinter).length === 0) {
      logger.warn(`No printer-enabled items found in order ${latestOrder.id}`);
      return { success: true, details: [] };
    }

    // Print cancellation receipt for each printer
    const printPromises = Object.entries(itemsByPrinter).map(
      ([ip, orderItems]) =>
        this.printCancellationReceiptForPrinter(
          ip,
          orderItems,
          latestOrder,
          data
        )
    );

    const results = await Promise.all(printPromises);

    return {
      success: results.every((r) => r.success),
      details: results,
    };
  }

  private groupItemsByPrinter(orderItems: any[]) {
    return orderItems.reduce<Record<string, typeof orderItems>>(
      (acc, orderItem) => {
        const ip = orderItem.menuItem.Printer?.ip;
        if (!ip) {
          logger.warn(`No printer for item ${orderItem.menuItem.id}, skipping`);
          return acc;
        }
        (acc[ip] ||= []).push(orderItem);
        return acc;
      },
      {}
    );
  }

  private async printCancellationReceiptForPrinter(
    ip: string,
    orderItems: any[],
    latestOrder: any,
    data: any
  ) {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${ip}`,
      options: { timeout: 10000 },
    });

    if (!(await printer.isPrinterConnected())) {
      logger.warn(`Printer ${ip} not connected`);
      return { ip, success: false, error: "Not connected" };
    }

    try {
      const cancellationReceiptTemplate =
        this.generateCancellationReceiptTemplate(orderItems, latestOrder, data);

      const outputPath = await renderOrderCancellationReceipt(
        cancellationReceiptTemplate
      );
      const image = fs.readFileSync(outputPath);

      if (image) {
        await printer.printImageBuffer(image);
        printer.cut();
        await printer.execute();
        fs.unlinkSync(outputPath);
        logger.info(
          `Printed full order cancellation for order ${latestOrder.id} on ${ip}`
        );
      }

      return { ip, success: true };
    } catch (err) {
      logger.error(`Order cancellation print failed on ${ip}:`, err);
      return { ip, success: false, error: String(err) };
    }
  }

  private generateCancellationReceiptTemplate(
    orderItems: any[],
    latestOrder: any,
    data: any
  ): string {
    // Aggregate items by menu item and notes
    const aggregated = this.aggregateOrderItems(orderItems);

    // Sort so items with notes come first
    aggregated.sort((a, b) => +!!b.notes - +!!a.notes);

    // Build table rows HTML
    const rowsHtml = this.buildItemRowsHtml(aggregated);
    const tableName = latestOrder.table?.name || `Table ${data.tableId}`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
      body {
        display: flex;
        justify-content: center;
        background: #f0f0f0;
      }
      .receipt {
        padding: 6px;
        width: 300px;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        transform: scale(2);
        transform-origin: top center;
        font-family: monospace;
        line-height: 1.4;
      }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      hr {
        border: none;
        border-top: 1px dashed #333;
        margin: 8px 0;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
      }
        
      .items-table th {
          background: #d32f2f;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 13px;
      }
      
      .items-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #eee;
          vertical-align: top;
      }
      
      .items-table tbody tr:nth-child(even) {
          background: #ffeaea;
      }
      
      .cancelled-item {
          background: #ffebee !important;
          color: #d32f2f;
      }
      
      .cancelled-item:hover {
          background: #ffcdd2 !important;
      }
      
      .qty-col {
          width: 15%;
          text-align: center;
          font-weight: bold;
      }
      
      .item-col {
          width: 85%;
      }
      
      .item-name {
          font-weight: bold;
          color: #d32f2f;
          margin-bottom: 4px;
          text-decoration: line-through;
      }
      
      .item-note {
          font-size: 14px;
          color: #666;
          font-style: italic;
          margin-left: 4px;
          margin-bottom: 4px;
      }
      
      .cancellation-header {
          background: #d32f2f;
          color: white;
          padding: 8px;
          text-align: center;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
      }
      
      .overall-reason {
          background: #ffebee;
          border: 2px solid #d32f2f;
          padding: 8px;
          margin: 10px 0;
          border-radius: 4px;
      }
      
      .overall-reason .label {
          font-weight: bold;
          color: #d32f2f;
          margin-bottom: 4px;
      }
      
      .order-info {
          background: #fff3e0;
          border: 1px solid #ff9800;
          padding: 8px;
          margin: 10px 0;
          border-radius: 4px;
      }
      
      .order-info .label {
          font-weight: bold;
          color: #ef6c00;
          margin-bottom: 4px;
      }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="cancellation-header">FULL ORDER CANCELLATION</div>
    <div>Order #: ${latestOrder.id}</div>
    <div>Table   : ${tableName}</div>
    <div>User    : ${data.user.username || ""}</div>
    <div>Time    : ${new Date().toLocaleString()}</div>
    <hr/>

    <div class="order-info">
      <div class="label">ORIGINAL ORDER TIME:</div>
      <div>${latestOrder.createdAt.toLocaleString()}</div>
    </div>

    ${
      data.cancellationReason
        ? `
    <div class="overall-reason">
      <div class="label">CANCELLATION REASON:</div>
      <div>${data.cancellationReason}</div>
    </div>
    `
        : ""
    }

    <table class="items-table">
      <thead>
        <tr>
          <th class="qty-col">QTY</th>
          <th class="item-col">CANCELLED ITEMS</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <hr/>
    <div class="center bold" style="color: #d32f2f; font-size: 18px;">
      🚫 ENTIRE ORDER CANCELLED 🚫
    </div>
    <div class="center" style="font-size: 12px; margin-top: 8px; color: #d32f2f;">
      STOP ALL PREPARATION FOR THIS ORDER
    </div>
  </div>
</body>
</html>`;
  }

  private aggregateOrderItems(orderItems: any[]) {
    return orderItems.reduce<
      Array<{
        menuItem: any;
        notes: string | null;
        quantity: number;
        price: number;
      }>
    >((acc, orderItem) => {
      const existing = acc.find(
        (aggItem) =>
          aggItem.menuItem.id === orderItem.menuItem.id &&
          aggItem.notes === orderItem.notes
      );
      if (existing) {
        existing.quantity += orderItem.quantity;
      } else {
        acc.push({
          menuItem: orderItem.menuItem,
          notes: orderItem.notes,
          quantity: orderItem.quantity,
          price: orderItem.price,
        });
      }
      return acc;
    }, []);
  }

  private buildItemRowsHtml(aggregatedItems: any[]): string {
    return aggregatedItems
      .map((aggItem) => {
        const noteHtml = aggItem.notes
          ? `<div class="item-note bold">◇ ${aggItem.notes}</div>`
          : "";

        return `
    <tr class="cancelled-item">
      <td class="qty-col">${aggItem.quantity} X</td>
      <td class="item-col">
        <div class="item-name">❌ ${aggItem.menuItem.title_en}</div>
        ${noteHtml}
      </td>
    </tr>
  `;
      })
      .join("");
  }

  private async updateSupplyQuantities(tx: any, latestOrder: any) {
    // Aggregate order items by menu item title to get total quantities
    const reducedItems = this.reduceOrderItems(latestOrder.items);

    console.log("Reduced Items: ", reducedItems);

    // Get supply items for each menu item
    const menuItemsWithSupply = await Promise.all(
      reducedItems.map(async (item) => {
        const supply = await tx.supply.findFirst({
          where: {
            name: {
              equals: item.menuItem.title_en,
              mode: "insensitive",
            },
          },
        });
        return supply;
      })
    );

    // Aggregate quantities for supplies with duplicate items
    const supplyQuantityMap = new Map<
      number,
      {
        supply: NonNullable<(typeof menuItemsWithSupply)[0]>;
        quantity: number;
      }
    >();

    reducedItems.forEach((item, idx) => {
      const supply = menuItemsWithSupply[idx];
      if (supply && item?.quantity) {
        const key = supply.id;
        if (supplyQuantityMap.has(key)) {
          supplyQuantityMap.get(key)!.quantity += item.quantity;
        } else {
          supplyQuantityMap.set(key, { supply, quantity: item.quantity });
        }
      }
    });

    const menuItemsWithQuantity = Array.from(supplyQuantityMap.values());

    // Update supply quantities by adding back the canceled order quantities
    for (const item of menuItemsWithQuantity) {
      const prevSupply = await tx.supply.findFirst({
        where: {
          id: item.supply.id,
        },
      });
      await tx.supply.update({
        where: {
          id: item.supply.id,
        },
        data: {
          remainingQuantity:
            (prevSupply?.remainingQuantity || 0) + item.quantity, // Add back the quantities to supply
        },
      });
    }
  }

  private reduceOrderItems(orderItems: any[]) {
    return orderItems.reduce((acc: any[], item) => {
      const existingItem = acc.find(
        (i: any) => item.menuItem.title_en === i.menuItem.title_en
      );
      if (existingItem) {
        existingItem.quantity += item.quantity ?? 1;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);
  }
}

// Keep the renderOrderCancellationReceipt function unchanged
async function renderOrderCancellationReceipt(html: string) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // 1) Load your HTML
  await page.setContent(html);

  // 2) Grab the receipt container
  const receipt = await page.$(".receipt");
  if (!receipt) {
    throw new Error("Could not find .receipt element");
  }

  // 3) Screenshot just that element
  const buffer = await receipt.screenshot({
    omitBackground: true, // => removes any transparent padding
  });

  await browser.close();

  // 4) Write it out
  const outPath = path.join(__dirname, "order-cancellation-receipt.png");
  fs.writeFileSync(outPath, buffer);

  return outPath;
}
