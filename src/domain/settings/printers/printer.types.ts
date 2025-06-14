import { Request, Response } from "express";
import { z } from "zod";
import { TResult } from "../../../types/common";

export const PrinterObjectSchema = z.object({
  id: z.number().optional(),
  ip: z.string().optional().default("0.0.0.0"),
  name: z.string().optional().default("New Printer"),
  description: z.string().nullable().optional(),
  settingsId: z.number().nullable().optional(),
});

export type Printer = z.infer<typeof PrinterObjectSchema>;

export interface PrinterServiceInterface {
  getPrinters(): Promise<TResult<Printer[]>>;
  getPrinterByName(name: any): Promise<TResult<Printer>>;
  getPrinterById(requestId: any): Promise<TResult<Printer>>;
  createPrinter(requestData: any): Promise<TResult<void>>;
  updatePrinter(requestData: any, requestId: any): Promise<TResult<void>>;
  deletePrinter(requestId: any): Promise<TResult<void>>;
}

export interface PrinterControllerInterface {
  getPrinters(req: Request, res: Response): Promise<Response<Printer[]>>;
  getPrinterById(req: Request, res: Response): Promise<Response<Printer>>;
  createPrinter(req: Request, res: Response): Promise<Response<void>>;
  updatePrinter(req: Request, res: Response): Promise<Response<void>>;
  deletePrinter(req: Request, res: Response): Promise<Response<void>>;
}
