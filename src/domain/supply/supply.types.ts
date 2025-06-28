import { Request, Response } from "express";
import { z } from "zod";
import { TResult } from "../../types/common";
import { CompanyInfoSchema } from "../settings/crm/crm.types";

export const SupplySchema = z.object({
  id: z.number().optional(),
  invoiceNO: z.string().nullable().optional(),
  companyId: z.number(),
  company: CompanyInfoSchema.optional(),
  paymentMethod: z.enum(["CASH", "CARD", "DEBT"]).default("CASH"),
  barcode: z.string().nullable().optional(),
  name: z.string(),
  packageQty: z.number(),
  itemQty: z.number(),
  packagePrice: z.number(),
  itemPrice: z.number(),
  itemSellPrice: z.number(),
  totalItems: z.number().nullable().optional(),
  totalPrice: z.number().nullable().optional(),
  remainingQuantity: z.number().nullable().optional(),
  store: z.string().nullable().optional(),
  note: z.string().nullable().optional(),

  expiryDate: z.date().nullable().optional(),
  purchasedAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Supply = z.infer<typeof SupplySchema>;

export interface SupplyServiceInterface {
  getSupplies: (q: string | undefined) => Promise<TResult<Supply[]>>;
  getSupplyById: (requestId: any) => Promise<TResult<Supply>>;
  createSupply: (requestData: any) => Promise<TResult<void>>;
  updateSupply: (requestId: any, requestData: any) => Promise<TResult<void>>;
  deleteSupply: (requestId: any) => Promise<TResult<void>>;
}

export interface SupplyControllerInterface {
  getSupplies: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Supply[]>>>;
  getSupplyById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Supply>>>;
  createSupply: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  updateSupply: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  deleteSupply: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
}
