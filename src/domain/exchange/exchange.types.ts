import { Request, Response } from "express";
import { z } from "zod";
import { TResult, UserSchema } from "../../types/common";

export const ExchangeRateSchema = z.object({
  id: z.number().optional(),
  rate: z.number(),
  userId: z.number(),
  user: UserSchema.optional(),
  exchangeDate: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;
// ExchangeRateSchema.pick({user: UserSchema.pick({role: true, username: true})})
export const ExchangeRateWithUserRoleSchema = ExchangeRateSchema.extend({
  user: UserSchema.pick({ role: true, username: true }).optional(),
});

export type ExchangeRateWithUserRole = z.infer<
  typeof ExchangeRateWithUserRoleSchema
>;

export interface ExchangeRateServiceInterface {
  getLatestExchangeRate: () => Promise<TResult<ExchangeRateWithUserRole>>;
  getExchangeRates: () => Promise<TResult<ExchangeRateWithUserRole[]>>;
  createExchangeRate: (data: any) => Promise<TResult<null>>;
}

export interface ExchangeRateControllerInterface {
  getLatestExchangeRate: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<ExchangeRateWithUserRole>>>;
  getExchangeRates: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<ExchangeRateWithUserRole[]>>>;
  createExchangeRate: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<null>>>;
}
