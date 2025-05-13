import { Request, Response } from "express";
import { InvoiceServices } from "../../../domain/invoice/invoice.services";
import { InvoiceControllerInterface } from "../../../domain/invoice/invoice.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";

export class InvoiceController implements InvoiceControllerInterface {
  async getInvoices(req: Request, res: Response) {
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.getInvoices();

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }
  async findInvoice(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.findInvoice(id);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }
  async findInvoicesByOrderId(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.findInvoicesByOrderId(id);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }
  async createInvoice(req: Request, res: Response) {
    const body = req.body;
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.createInvoice(body);

    return res.status(
      response.success ? CREATED_STATUS : response.error?.code || 500
    );
  }
  async updateInvoice(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const body = req.body;
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.updateInvoice(id, body);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }
  async deleteInvoice(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const invoiceInstance = new InvoiceServices();
    const response = await invoiceInstance.deleteInvoice(id);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }
}
