import { Request, Response } from "express";
import { z } from "zod";
import { TResult, UserSchema } from "../../types/common";

export const ExchangeRateSchema = z.object({
  id: z.number().optional(),
  rate: z.number(),
  userId: z.number(),
  user: UserSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

export interface ExchangeRateServiceInterface {
  getLatestExchangeRate: () => Promise<TResult<ExchangeRate>>;
  getExchangeRates: () => Promise<TResult<ExchangeRate[]>>;
  createExchangeRate: (data: any) => Promise<TResult<ExchangeRate>>;
}

export interface ExchangeRateControllerInterface {
  getLatestExchangeRate: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<ExchangeRate>>>;
  getExchangeRates: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<ExchangeRate[]>>>;
  createExchangeRate: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<null>>>;
}
