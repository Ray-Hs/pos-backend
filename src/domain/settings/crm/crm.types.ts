import { Request, Response } from "express";
import { z } from "zod";
import { TResult } from "../../../types/common";

export const Currency = z.enum(["IQD", "USD"]);

export const CompanyInfoSchema = z.object({
  id: z.number().optional(),
  code: z.string().nullable().optional(),
  currency: Currency.nullable(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  CRMId: z.number().nullable().optional(),
});

export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;

export interface CRMServiceInterface {
  getCustomers(): Promise<TResult<CustomerInfo[]>>;
  getCustomerByPhone(phone: any): Promise<TResult<CustomerInfo>>;
  getCustomerById(requestId: any): Promise<TResult<CustomerInfo>>;
  createCustomer(requestData: any): Promise<TResult<void>>;
  updateCustomer(requestData: any, requestId: any): Promise<TResult<void>>;
  deleteCustomer(requestId: any): Promise<TResult<void>>;

  getCompanies(): Promise<TResult<CompanyInfo[]>>;
  getCompanyById(requestId: any): Promise<TResult<CompanyInfo>>;
  createCompany(requestData: any): Promise<TResult<void>>;
  updateCompany(requestData: any, requestId: any): Promise<TResult<void>>;
  deleteCompany(requestId: any): Promise<TResult<void>>;

  getCustomerDiscounts(filter: {
    isActive: boolean;
  }): Promise<TResult<CustomerDiscount[]>>;
  getCustomerDiscountById(
    requestId: any,
    filter: {
      isActive: boolean;
    }
  ): Promise<TResult<CustomerDiscount>>;
  createCustomerDiscount(requestData: any): Promise<TResult<void>>;
  updateCustomerDiscount(
    requestData: any,
    requestId: any
  ): Promise<TResult<void>>;
  deleteCustomerDiscount(requestId: any): Promise<TResult<void>>;
}

export interface CRMControllerInterface {
  getCustomers(req: Request, res: Response): Promise<Response<CustomerInfo[]>>;
  getCustomerById(req: Request, res: Response): Promise<Response<CustomerInfo>>;
  createCustomer(req: Request, res: Response): Promise<Response<void>>;
  updateCustomer(req: Request, res: Response): Promise<Response<void>>;
  deleteCustomer(req: Request, res: Response): Promise<Response<void>>;

  getCompanies(req: Request, res: Response): Promise<Response<CompanyInfo[]>>;
  getCompanyById(req: Request, res: Response): Promise<Response<CompanyInfo>>;
  createCompany(req: Request, res: Response): Promise<Response<void>>;
  updateCompany(req: Request, res: Response): Promise<Response<void>>;
  deleteCompany(req: Request, res: Response): Promise<Response<void>>;

  getCustomerDiscounts(
    req: Request,
    res: Response
  ): Promise<Response<CustomerDiscount[]>>;
  getCustomerDiscountById(
    req: Request,
    res: Response
  ): Promise<Response<CustomerDiscount>>;
  createCustomerDiscount(req: Request, res: Response): Promise<Response<void>>;
  updateCustomerDiscount(req: Request, res: Response): Promise<Response<void>>;
  deleteCustomerDiscount(req: Request, res: Response): Promise<Response<void>>;
}

export const CustomerDiscountSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  phoneNumber: z.string().nullable().optional(),
  discount: z.number(),
  isActive: z.boolean().nullable().optional(),
  customerInfoId: z.number().nullable().optional(),
  CRMId: z.number().nullable().optional(),
});

export const CustomerInfoSchema = z.object({
  id: z.number().optional(),
  code: z.string().nullable().optional(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().nullable().optional(),
  debt: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
  CRMId: z.number().nullable().optional(),
  customerDiscount: CustomerDiscountSchema.nullable().optional(),
});

export type CustomerInfo = z.infer<typeof CustomerInfoSchema>;
export type CustomerDiscount = z.infer<typeof CustomerDiscountSchema>;
