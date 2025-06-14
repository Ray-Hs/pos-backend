import { z } from "zod";
import { TResult } from "../../../types/common";
import { Request, Response } from "express";

export const BrandObject = z.object({
  id: z.number().optional(),
  restaurantName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),

  restaurantLogo: z.string().nullable().optional(),
  receiptHeader: z.string().nullable().optional(),
  receiptFooter: z.string().nullable().optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),

  settingsId: z.number().optional(),
});

export type Brand = z.infer<typeof BrandObject>;

export interface BrandServiceInterface {
  getBrand: () => Promise<TResult<Brand>>;
  createBrand: (requestData: any) => Promise<TResult<void>>;
  updateBrand: (requestData: any, requestId: any) => Promise<TResult<void>>;
  deleteBrand: (requestId: any) => Promise<TResult<void>>;
}

export interface BrandControllerInterface {
  getBrand: (req: Request, res: Response) => Promise<Response<TResult<Brand>>>;
  createBrand: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  updateBrand: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  deleteBrand: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
}
