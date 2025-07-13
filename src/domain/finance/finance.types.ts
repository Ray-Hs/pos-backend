import { Request, Response } from "express";
import { z } from "zod";
import { TResult, UserSchema } from "../../types/common";
import {
  CompanyInfoSchema,
  Currency,
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

export const PaymentEnumSchema = z.enum(["PAID", "PARTIAL", "PENDING"]);
export type PaymentEnum = z.infer<typeof PaymentEnumSchema>;

export const CompanyDebtSchema = z.object({
  id: z.number().optional(),
  companyId: z.number().optional(),
  company: CompanyInfoSchema.optional(),
  product: z.string(),
  invoiceNumber: z.string().nullable().optional(),
  quantity: z.number(),
  price: z.number(),
  totalAmount: z.number().nullable().optional(),
  remainingAmount: z.number().nullable().optional(),
  userId: z.number(),
  currency: Currency.optional(),
  status: PaymentEnumSchema.optional(),
  totalDebt: z
    .object({
      IQD: z.number().optional(),
      USD: z.number().optional(),
    })
    .optional(),
  totalPaid: z
    .object({
      IQD: z.number().optional(),
      USD: z.number().optional(),
    })
    .optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const PaymentSchema = z.object({
  id: z.number().optional(),
  companyDebtId: z.number().optional(),
  companyDebt: CompanyDebtSchema.optional(),
  companyId: z.number(),
  company: CompanyInfoSchema.optional(),
  invoiceNumber: z.string(),
  userId: z.number(),
  currency: Currency.optional(),
  amount: z.number(),
  note: z.string().nullable().optional(),
  isLatestVersion: z.boolean().nullable().optional(),
  paymentDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const totalDebtAndPaidSchema = z.object({
  totalDebt: z
    .object({
      IQD: z.number().optional(),
      USD: z.number().optional(),
    })
    .optional(),
  totalPaid: z
    .object({
      IQD: z.number().optional(),
      USD: z.number().optional(),
    })
    .optional(),
});

export type totalDebtAndPaid = z.infer<typeof totalDebtAndPaidSchema>;

export const allCompanyDebtSchema = z.object({
  id: z.number().optional(),
  companyDebtId: z.number(),
  companyDebt: CompanyDebtSchema.optional(),
  company: CompanyInfoSchema.optional(),
  latestCompanyDebt: z.date().optional(),
  amount: z.number().optional(),
  phoneNumber: z.string().optional(),
  companyCode: z.string().optional(),
});

export type payment = z.infer<typeof PaymentSchema>;
export type companyDebt = z.infer<typeof CompanyDebtSchema>;
export type AllCompanyDebt = z.infer<typeof allCompanyDebtSchema>;

export interface FinanceServiceInterface {
  createCompanyDebt(requestData: companyDebt): Promise<TResult<companyDebt>>;
  getCompanyDebtById(id: number): Promise<TResult<companyDebt>>;
  updateCompanyDebt(
    id: number,
    requestData: companyDebt
  ): Promise<TResult<null>>;
  deleteCompanyDebt(id: number): Promise<TResult<null>>;
  listCompanyDebts({
    fromDate,
    toDate,
  }: {
    fromDate: string;
    toDate: string;
  }): Promise<
    TResult<
      { companyDebt: companyDebt[] } & totalDebtAndPaid & { pages: number }
    >
  >;
  getAllCompanyDebts(): Promise<TResult<AllCompanyDebt[]>>;

  // Payment methods
  createPayment(requestData: payment): Promise<TResult<payment>>;
  getPaymentById(id: number): Promise<TResult<payment>>;
  updatePayment(id: number, requestData: payment): Promise<TResult<null>>;
  deletePayment(id: number): Promise<TResult<null>>;
  listPayments(
    {
      fromDate,
      toDate,
    }: {
      fromDate?: string;
      toDate?: string;
    },
    pagination?: {
      limit?: number;
      page?: number;
    }
  ): Promise<
    TResult<{ payments: payment[] } & totalDebtAndPaid & { pages: number }>
  >;
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
  getALLCompanyDebts(
    req: Request,
    res: Response
  ): Promise<Response<TResult<AllCompanyDebt[]>>>;

  // Payment methods
  createPayment(
    req: Request,
    res: Response
  ): Promise<Response<TResult<payment>>>;
  getPaymentById(
    req: Request,
    res: Response
  ): Promise<Response<TResult<payment>>>;
  updatePayment(req: Request, res: Response): Promise<Response<TResult<null>>>;
  deletePayment(req: Request, res: Response): Promise<Response<TResult<null>>>;
  listPayments(
    req: Request,
    res: Response
  ): Promise<Response<TResult<payment[]>>>;
}
