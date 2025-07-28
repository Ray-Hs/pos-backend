import { Request, Response } from "express";
import { InvoiceServices } from "../../../domain/invoice/invoice.services";
import { InvoiceControllerInterface } from "../../../domain/invoice/invoice.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import { PaymentMethod, UserWithoutPassword } from "../../../types/common";
import { decodeJWT } from "../../../infrastructure/utils/decodeJWT";

export class InvoiceController implements InvoiceControllerInterface {
  async getInvoices(req: Request, res: Response) {
    const filterBy = req.query.filterBy as string | undefined;
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.getInvoices(
      filterBy ? (filterBy.toUpperCase() as PaymentMethod) : undefined
    );

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async showcaseInvoices(req: Request, res: Response) {
    const filterBy = req.query.filterBy as string | undefined;
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.showcaseInvoices(
      filterBy ? filterBy.toUpperCase() : undefined
    );

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async groupOrderItems(req: Request, res: Response) {
    const orderId = parseInt(req.params.orderId, 10);
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.groupOrderItems(orderId);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
  async findInvoice(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.findInvoice(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
  async findInvoicesByOrderId(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.findInvoicesByOrderId(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
  async createInvoice(req: Request, res: Response) {
    const body = req.body;
    const userId = decodeJWT(req, res) as UserWithoutPassword;
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.createInvoice({
      ...body,
      userId: userId.id,
    });

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }
  async updateInvoice(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const body = req.body;
    const userId = decodeJWT(req, res) as UserWithoutPassword;
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.updateInvoice(id, {
      ...body,
      userId: userId.id,
    });

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
  async deleteInvoice(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.deleteInvoice(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
