import { ZodError } from "zod";
import prisma from "../../infrastructure/database/prisma/client";
import { calculateSkip, Take } from "../../infrastructure/utils/calculateSkip";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  INVOICE_NOT_FOUND,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import { Invoice, InvoiceSchema, PaymentMethod } from "../../types/common";
import { getConstantsDB } from "../constants/constants.repository";
import { findOrderByIdDB, getLatestOrderDB } from "../order/order.repository";
import {
  getCustomerByIdDB,
  updateCustomerInfoDB,
} from "../settings/crm/crm.repository";
import { printerService } from "../settings/printers/printer.services";
import { findTableByIdDB, updateTableDB } from "../table/table.repository";
import {
  calculateSubtotal,
  calculateTotal,
  createInvoiceDB,
  deleteInvoiceDB,
  findInvoiceByIdDB,
  getFinanceInvoicesDB,
  getInvoicesDB,
  groupOrderItemsDB,
  updateInvoiceDB,
} from "./invoice.repository";
import { InvoiceServiceInterface } from "./invoice.types";

export class InvoiceServices implements InvoiceServiceInterface {
  async getInvoices(filterBy?: PaymentMethod | undefined) {
    try {
      const data = await getInvoicesDB(filterBy);

      if (!data || data.length === 0) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: INVOICE_NOT_FOUND,
          },
        };
      }
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Get Invoices: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async showcaseInvoices(q?: string, page?: number, limit?: number) {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      let invoiceRef;
      if (q) {
        invoiceRef = parseInt(q as string);
      }

      const invoices = await prisma.invoiceRef.findMany({
        where: {
          id: invoiceRef,
          createdAt: {
            gte: yesterday,
            lte: now,
          },
        },
        take: Take(limit),
        skip: calculateSkip(page, limit),
        include: {
          invoices: {
            include: { service: true, tax: true, customerDiscount: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Group items by menuItem title for each invoice and calculate totals
      const data = invoices.map((invoice) => {
        return {
          invoiceRef: {
            id: invoice.id,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
            orderId: invoice.orderId,
            invoices: invoice.invoices.map((inv) => ({
              total: inv.total,
              subtotal: inv.subtotal,
              discount: inv.discount,
              customerDiscount: inv.customerDiscount,
              id: inv.id,
              createdAt: inv.createdAt,
              paid: inv.paid,
              paymentMethod: inv.paymentMethod,
              debt: inv.debt,
              version: inv.version,
            })),
          },
        };
      });

      if (!data || data.length === 0) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: INVOICE_NOT_FOUND,
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Showcase Invoices: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async groupOrderItems(orderId: number) {
    try {
      const data = await groupOrderItemsDB(orderId);

      if (!data || data.length === 0) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: "No order items found",
          },
        };
      }
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Group Order Items: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async findInvoice(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        InvoiceSchema.pick({ id: true })
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

      const data = await findInvoiceByIdDB(response.id);

      if (!data) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: INVOICE_NOT_FOUND,
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Find Invoice By ID: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async getInvoiceRefById(requestId?: any) {
    try {
      const data = await getFinanceInvoicesDB(requestId);

      if (!data) {
        logger.warn("Invoice Ref Not Found");

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
      logger.error("Find Invoice By ID: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async findInvoicesByOrderId(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        InvoiceSchema.pick({ id: true })
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
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: INVOICE_NOT_FOUND,
          },
        };
      }

      const invoices = data.Invoice;

      if (!invoices || invoices.length === 0) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: INVOICE_NOT_FOUND,
          },
        };
      }

      // Map invoices to include all required properties (like version)
      const mappedInvoices = invoices.map((inv: any) => ({
        ...inv,
        id: inv.id,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        orderId: inv.orderId,
        version: inv.version,
        discount: inv.discount,
        subtotal: inv.subtotal,
        total: inv.total,
        userId: inv.userId,
        taxId: inv.taxId,
        serviceId: inv.serviceId,
        invoiceRefId: inv.invoiceRefId,
        customerDiscountId: inv.customerDiscountId,
        paid: inv.paid,
      }));

      return {
        success: true,
        data: mappedInvoices,
      };
    } catch (error) {
      logger.error("Find Invoice By Order ID: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createInvoice(requestData: any) {
    try {
      const data = await validateType(requestData, InvoiceSchema);

      if (data instanceof ZodError) {
        logger.warn("Missing Info");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const createdInvoice: Invoice = await prisma.$transaction(async (tx) => {
        const {
          discount,
          customerDiscount,
          customerDiscountId,
          id,
          tableId,
          ...rest
        } = data;
        const createdInvoice = await createInvoiceDB(data, tx);

        const invoiceRef = await tx.invoiceRef.findFirst({
          where: {
            id: data.invoiceRefId,
          },
        });

        if (!invoiceRef) {
          throw new Error("No Invoice Ref Found");
        }

        const order = await findOrderByIdDB(invoiceRef.orderId as number, tx);
        if (!order) {
          throw new Error(`Order with ID ${invoiceRef?.orderId} not found`);
        }

        const constants = await getConstantsDB(tx);

        // Calculate subtotal from order items
        const subtotal = calculateSubtotal(order.items);

        // Calculate total with tax, service, and discount
        const total = calculateTotal(
          subtotal,
          constants,
          discount || customerDiscount?.discount
        );

        const invoice = await createInvoiceDB(
          {
            ...rest,
            tableId,
            subtotal,
            total,
            userId: data.userId as number,
            taxId: constants.tax?.id,
            serviceId: constants.service?.id,
            invoiceRefId: invoiceRef?.id,
            version: 1,
            customerDiscountId: customerDiscountId,
            discount: discount || customerDiscount?.discount,
          },
          tx
        );
        if (tableId) {
          console.log("Invoice Table ID: ", tableId);
          await tx.table.update({
            where: {
              id: tableId || undefined,
            },
            data: {
              status: "AVAILABLE",
              orders: {
                disconnect: {
                  id: invoiceRef.orderId ?? undefined,
                },
              },
            },
          });
        }

        return invoice;
      });

      return {
        success: true,
        data: createdInvoice,
      };
    } catch (error) {
      logger.error("Find Invoice By ID: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async updateInvoice(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        InvoiceSchema.pick({ id: true })
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
      const data = await validateType(requestData, InvoiceSchema);

      if (data instanceof ZodError) {
        logger.warn("Missing Info");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const invoice = await findInvoiceByIdDB(response.id);
      if (!invoice) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: INVOICE_NOT_FOUND,
          },
        };
      }

      console.table([invoice]);

      if (data.paymentMethod === "RECEIPT") {
        const updatedInvoice = await prisma.$transaction(async (tx) => {
          const printerServices = new printerService();
          if (!data.tableId) {
            throw new Error("Table ID Not Provided.");
          }
          const order = await getLatestOrderDB(data.tableId);
          const table = await findTableByIdDB(data.tableId);
          const updatedInvoice = await updateInvoiceDB(
            data.id as number,
            {
              paymentMethod: data.paymentMethod,
            },
            tx
          );

          if (!table) {
            throw new Error("Table not found.");
          }

          const updatedTable = await updateTableDB(
            data.tableId,
            {
              ...table,
              name: table.name ?? "",
              status: "RECEIPT",
              capacity: table.capacity, // Ensure capacity is present and not undefined
              available: table.available, // Ensure available is present
              sortOrder: table.sortOrder, // Ensure sortOrder is present
            },
            tx
          );

          const customerInfo = data.customerInfoId
            ? await getCustomerByIdDB(data.customerInfoId, tx)
            : null;

          const constants = await getConstantsDB(tx);
          const total = customerInfo
            ? calculateTotal(
                order?.Invoice[0].invoices[0].subtotal || 0,
                constants,
                customerInfo.customerDiscount?.discount
              )
            : order?.Invoice[0].invoices[0].total;

          // await printerServices.print(1, {
          //   orderId: order?.id,
          //   items: order?.items.map((item) => ({
          //     title_en: item.menuItem.title_en,
          //     quantity: item.quantity,
          //     price: item.price,
          //   })),
          //   customer: customerInfo
          //     ? {
          //         name: customerInfo.name,
          //         discount: customerInfo.customerDiscount?.discount,
          //       }
          //     : undefined,
          //   subtotal: order?.Invoice[0].invoices[0].subtotal,
          //   tax: constants.tax?.rate,
          //   service: constants.service?.amount,
          //   total: order?.Invoice[0].invoices[0].total,
          // });
        });
      }

      if (data.paymentMethod === "CASH" || data.paymentMethod === "CARD") {
        const updatedInvoice: Invoice = await prisma.$transaction(
          async (tx) => {
            const {
              id: _id,
              discount,
              customerDiscount,
              customerInfoId,
              ...rest
            } = data;

            const invoiceRef = await tx.invoiceRef.findFirst({
              where: {
                id: invoice.invoiceRefId,
              },
            });
            const order = await findOrderByIdDB(
              invoiceRef?.orderId as number,
              tx
            );

            if (!order) {
              throw new Error(`Order with ID ${invoiceRef?.orderId} not found`);
            }

            const hasTable = order.tableId;

            if (hasTable) {
              const table = await tx.table.update({
                where: {
                  id: order.tableId || 0,
                },
                data: {
                  orders: {
                    disconnect: { id: order.id },
                  },
                  status: "AVAILABLE",
                },
              });
            }

            const constants = await getConstantsDB(tx);
            const subtotal = calculateSubtotal(order.items);
            const total = calculateTotal(
              subtotal,
              constants,
              discount || customerDiscount?.discount
            );

            const updatedInvoice = await updateInvoiceDB(
              response.id as number,
              {
                ...rest,
                total,
                customerInfoId,
                discount,
                paid: true,
              },
              tx
            );
            return updatedInvoice;
          }
        );

        return {
          success: true,
          data: updatedInvoice,
        };
      }

      if (data.paymentMethod === "DEBT") {
        const updatedInvoice: Invoice = await prisma.$transaction(
          async (tx) => {
            const {
              id: _id,
              discount,
              customerDiscount,
              customerInfoId,
              debt,
              ...rest
            } = data;

            if (!debt) {
              throw new Error("Debt Value not provided.");
            }

            const invoiceRef = await tx.invoiceRef.findFirst({
              where: {
                id: invoice.invoiceRefId,
              },
            });
            const order = await findOrderByIdDB(
              invoiceRef?.orderId as number,
              tx
            );

            if (!order) {
              throw new Error(`Order with ID ${invoiceRef?.orderId} not found`);
            }

            const table = await tx.table.update({
              where: {
                id: order.tableId || 0,
              },
              data: {
                orders: {
                  disconnect: { id: order.id },
                },
                status: "AVAILABLE",
              },
            });

            const constants = await getConstantsDB(tx);
            const subtotal = calculateSubtotal(order.items);
            const total = calculateTotal(
              subtotal,
              constants,
              discount || customerDiscount?.discount
            );

            const updatedInvoice = await updateInvoiceDB(
              response.id as number,
              {
                ...rest,
                total,
                debt,
                customerInfoId,
                discount,
                paid: data.paid,
              },
              tx
            );

            if (customerInfoId && data.paymentMethod === "DEBT") {
              const customerInfo = await getCustomerByIdDB(
                customerInfoId as number,
                tx
              );
              if (!customerInfo) {
                logger.warn("No Customer Info Data");
                throw new Error("Customer Info not found.");
              }
              const customerInfoUpdate = await updateCustomerInfoDB(
                {
                  ...customerInfo,
                  debt: debt + (customerInfo.debt || 0),
                },
                customerInfoId,
                tx
              );
            }

            return updatedInvoice;
          }
        );

        return {
          success: true,
          data: updatedInvoice,
        };
      } else {
        console.log("Data: ", data);
        const updatedInvoice = await updateInvoiceDB(
          response.id as number,
          data,
          prisma
        );
        if (data.paymentMethod === "SPLIT") {
          const table = await findTableByIdDB(data.tableId as number);
          if (!table) {
            throw new Error("Table not found.");
          }
          await updateTableDB(
            data.tableId as number,
            { ...table, status: "SPLIT" },
            prisma
          );
        }
        return {
          success: true,
          data: updatedInvoice,
        };
      }
    } catch (error) {
      logger.error("Update Invoice Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteInvoice(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        InvoiceSchema.pick({ id: true })
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

      const invoice = await findInvoiceByIdDB(response.id);

      if (!invoice) {
        logger.warn(`Invoice with ID ${response.id} not found`);
        const deletedInvoice = await deleteInvoiceDB(response.id, prisma);
        return {
          success: true,
          data: deletedInvoice,
        };
      }

      return {
        success: false,
        error: {
          code: NOT_FOUND_STATUS,
          message: INVOICE_NOT_FOUND,
        },
      };
    } catch (error) {
      logger.error("Find Invoice By ID: ", error);
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
