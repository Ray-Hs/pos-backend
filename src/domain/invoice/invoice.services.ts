import { ZodError } from "zod";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  INVOICE_NOT_FOUND,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import { Invoice, InvoiceSchema } from "../../types/common";
import { findOrderByIdDB } from "../order/order.repository";
import {
  calculateTotal,
  createInvoiceDB,
  deleteInvoiceDB,
  findInvoiceByIdDB,
  getInvoicesDB,
  updateInvoiceDB,
} from "./invoice.repository";
import { InvoiceServiceInterface } from "./invoice.types";
import prisma from "../../infrastructure/database/prisma/client";
import { getConstantsDB } from "../constants/constants.repository";
import { CustomerDiscount } from "../settings/crm/crm.types";

export class InvoiceServices implements InvoiceServiceInterface {
  async getInvoices() {
    try {
      const data = await getInvoicesDB();

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
        const { discount, id, tableId, ...rest } = data;
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

        const subtotal = order.items.reduce(
          (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
          0
        );

        const total = calculateTotal(
          subtotal,
          constants,
          discount as CustomerDiscount
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
            customerDiscountId: discount?.id,
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

      if (data.paid) {
        const updatedInvoice = await prisma.$transaction(async (tx) => {
          const { id: _id, discount, ...rest } = data;
          const updatedInvoice = await updateInvoiceDB(
            response.id as number,
            { ...rest, paid: true },
            tx
          );

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

          const constants = await getConstantsDB(tx);
          const subtotal = order.items.reduce(
            (acc, item) => acc + (item?.price ?? 0) * (item?.quantity ?? 0),
            0
          );

          const total = calculateTotal(
            subtotal,
            constants,
            data.discount ?? (invoice?.discount as CustomerDiscount)
          );

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

          return updatedInvoice;
        });

        return {
          success: true,
          data: updatedInvoice,
        };
      } else {
        const updatedInvoice = await updateInvoiceDB(
          response.id as number,
          data,
          prisma
        );
        return {
          success: true,
          data: updatedInvoice,
        };
      }
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
