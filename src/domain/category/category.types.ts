import { Request, Response } from "express";
import { Category, Filter, TResult } from "../../types/common";
import { Prisma } from "@prisma/client";

export interface CategoryServiceInterface {
  getCategories: (filter?: Filter) => Promise<TResult<Category[]>>;
  findCategoryById: (idRequest: any) => Promise<TResult<Category>>;
  createCategory: (dataRequest: any) => Promise<TResult<Category>>;
  updateCategory: (
    idRequest: any,
    dataRequest: any
  ) => Promise<TResult<Category>>;
  deleteCategory: (idRequest: any) => Promise<TResult<Category>>;
}

export interface CategoryControllerInterface {
  getCategories: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Category>>>;
  getCategoryById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Category>>>;
  createCategory: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Category>>>;
  updateCategory: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Category>>>;
  deleteCategory: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Category>>>;
}
