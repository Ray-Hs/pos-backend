import { Request, Response } from "express";
import {
    printerService
} from "../../../../domain/settings/printers/printer.services";
import { PrinterControllerInterface } from "../../../../domain/settings/printers/printer.types";
import {
    CREATED_STATUS,
    OK_STATUS,
} from "../../../../infrastructure/utils/constants";

export class PrinterController implements PrinterControllerInterface {
  async getPrinters(req: Request, res: Response) {
    const printerServices = new printerService();
    const response = await printerServices.getPrinters();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getPrinterById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const printerServices = new printerService();
    const response = await printerServices.getPrinterById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createPrinter(req: Request, res: Response) {
    const printerServices = new printerService();
    const response = await printerServices.createPrinter(req.body);

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updatePrinter(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const printerServices = new printerService();
    const response = await printerServices.updatePrinter(req.body, id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deletePrinter(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const printerServices = new printerService();
    const response = await printerServices.deletePrinter(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
