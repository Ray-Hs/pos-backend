import { Request, Response } from "express";
import { z } from "zod";
import { TResult } from "../../types/common";
import {
  CompanyInfoSchema,
  CustomerInfoSchema,
} from "../settings/crm/crm.types";

export const CustomerDebt = z.object({
  id: z.number().optional(),
  name: z.string().nullable().optional(),
  quantity: z.number(),
  price: z.number(),
  invoiceNumber: z.string().nullable().optional(),
  customerInfo: CustomerInfoSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CompanyDebtSchema = z.object({
  id: z.number().optional(),
  companyId: z.number(),
  company: CompanyInfoSchema.optional(),
  product: z.string(),
  invoiceNumber: z.string().nullable().optional(),
  quantity: z.number(),
  price: z.number(),
  totalAmount: z.number().nullable().optional(),
});

export type companyDebt = z.infer<typeof CompanyDebtSchema>;

export interface FinanceServiceInterface {
  createCompanyDebt(requestData: companyDebt): Promise<TResult<companyDebt>>;
}

export interface FinanceControllerInterface {
  createCompanyDebt(
    req: Request,
    res: Response
  ): Promise<Response<TResult<companyDebt>>>;
  getCompanyDebtById(
    req: Request,
    res: Response
  ): Promise<Response<TResult<companyDebt>>>;
  updateCompanyDebt(
    req: Request,
    res: Response
  ): Promise<Response<TResult<null>>>;
  deleteCompanyDebt(
    req: Request,
    res: Response
  ): Promise<Response<TResult<null>>>;
  listCompanyDebts(
    req: Request,
    res: Response
  ): Promise<Response<TResult<companyDebt[]>>>;
}
