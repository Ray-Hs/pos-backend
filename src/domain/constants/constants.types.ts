import { Request, Response } from "express";
import { TResult } from "../../types/common";
import { z } from "zod";

export const ConstantSchema = z.object({
  tax: z
    .object({
      id: z.number().optional(),
      rate: z.number().optional(),
    })
    .nullable(),
  service: z
    .object({
      id: z.number().optional(),
      amount: z.number().optional(),
    })
    .nullable(),
});

export type Constant = z.infer<typeof ConstantSchema>;

export interface IConstantServices {
  getConstants: () => Promise<TResult<Constant>>;
  createConstants: (data: any) => Promise<TResult<Constant>>;
  updateConstants: (data: any) => Promise<TResult<Constant>>;
  deleteConstants: (data: any) => Promise<TResult<Constant>>;
}

export interface IConstantController {
  getConstants: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Constant>>>;
  createConstants: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Constant>>>;
  updateConstants: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Constant>>>;
  deleteConstants: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Constant>>>;
}
