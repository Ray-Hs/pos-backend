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

export const StorageItemSchema = z.object({
  item: z.string(),
  quantity: z.number(),
  price: z.number(),
  sellPrice: z.number(),
  totalValue: z.number(),
  profit: z.number(),
  companyDetails: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    note: z.string().nullable(),
  }),
  store: z.string().nullable(),
  itemCode: z.string().nullable(),
  expiryDate: z.date().nullable(),
  lastRestock: z.date().nullable(),
  lastSale: z.date().nullable(),
});

export const StoreLocationSchema = z.object({
  storeName: z.string(),
  items: z.array(StorageItemSchema),
  totalItems: z.number(),
  totalValue: z.number(),
  totalProfit: z.number(),
});

export const StorageSummarySchema = z.object({
  stores: z.array(StoreLocationSchema),
  totalStores: z.number(),
  totalItems: z.number(),
  totalValue: z.number(),
  totalProfit: z.number(),
});

export const StorageSchema = SupplySchema.pick({
  id: true,
  barcode: true,
  company: true,
  expiryDate: true,
  name: true,
  store: true,
  remainingQuantity: true,
  itemSellPrice: true,
  itemPrice: true,
  itemQty: true,
  totalItems: true,
  totalPrice: true,
});

export type Supply = z.infer<typeof SupplySchema>;
export type Storage = z.infer<typeof StorageSchema>;
export type StorageItem = z.infer<typeof StorageItemSchema>;
export type StoreLocation = z.infer<typeof StoreLocationSchema>;
export type StorageSummary = z.infer<typeof StorageSummarySchema>;

export interface SupplyServiceInterface {
  getStorage: (
    q: string | undefined,
    pagination?: {
      page?: number;
      limit?: number;
    },
    expired?: { expired?: boolean | undefined; days?: number | undefined }
  ) => Promise<TResult<StorageSummary & { pages?: number }>>;
  getStores: () => Promise<TResult<string[]>>;
  getSupplies: (
    q: string | undefined,
    pagination?: {
      page?: number;
      limit?: number;
    },
    expired?: { expired?: boolean | undefined; days?: number | undefined }
  ) => Promise<TResult<Supply[] & { pages?: number }>>;
  getSupplyById: (requestId: any) => Promise<TResult<Supply>>;
  createSupply: (requestData: any) => Promise<TResult<void>>;
  updateSupply: (requestId: any, requestData: any) => Promise<TResult<void>>;
  deleteSupply: (requestId: any) => Promise<TResult<void>>;
}

export interface SupplyControllerInterface {
  getStorage: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<StorageSummary>>>;
  getStores: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<string[]>>>;
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
