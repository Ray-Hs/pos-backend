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
import { InvoiceSchema } from "../../types/common";
import { findOrderByIdDB } from "../order/order.repository";
import {
  createInvoiceDB,
  deleteInvoiceDB,
  findInvoiceByIdDB,
  getInvoicesDB,
  updateInvoiceDB,
} from "./invoice.repository";
import { InvoiceServiceInterface } from "./invoice.types";

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

      const data = await findOrderByIdDB(response.id);

      if (!data) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: INVOICE_NOT_FOUND,
          },
        };
      }

      const invoice = data.Invoice;

      if (invoice.length === 0) {
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
        data: invoice,
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

      const createdInvoice = await createInvoiceDB(data);
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
        const updatedInvoice = await updateInvoiceDB(response.id, data);
        return {
          success: true,
          data: updatedInvoice,
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

      const invoice = findInvoiceByIdDB(response.id);
      if (!invoice) {
        const deletedInvoice = await deleteInvoiceDB(response.id);
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
