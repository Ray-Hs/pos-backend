import { DeletedOrderItem } from "@prisma/client";
import { Request, Response } from "express";
import { z } from "zod";
import { TResult } from "../../types/common";

export const ReportSchema = z.object({
  code: z.string(),
  productName: z.string(),
  companyName: z.string(),
  employeeName: z.string().optional(),
  quantity: z.number(),
  sellingPrice: z.number(),
  totalSellingPrice: z.number(),
  purchasePrice: z.number(),
  totalPurchasePrice: z.number(),
  profit: z.number(),
});

export type Report = z.infer<typeof ReportSchema>;

export interface ReportServiceInterface {
  getCloseDayReport: (
    from?: Date,
    to?: Date,
    company?: string
  ) => Promise<TResult<Report[]>>;
  closeDayShift?: () => Promise<TResult<Report[]>>;
  getDailyReport: (from?: Date, to?: Date) => Promise<TResult<Report[]>>;
  getCompanyReport: (
    from?: Date,
    to?: Date,
    company?: string
  ) => Promise<TResult<Report[]>>;
  getEmployeeReport: (
    from?: Date,
    to?: Date,
    employee?: string
  ) => Promise<TResult<Report[]>>;
  getDeletedItemsReport: (
    from?: Date,
    to?: Date
  ) => Promise<TResult<{ orderId: number; order: any; items: any[] }[]>>;
}

export interface ReportControllerInterface {
  getCloseDayReport: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Report>>>;
  closeDayShift?: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Report[]>>>;
  getDailyReport: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Report>>>;
  getCompanyReport: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Report>>>;
  getEmployeeReport: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Report>>>;
  getDeletedItemsReport: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<DeletedOrderItem>>>;
}
