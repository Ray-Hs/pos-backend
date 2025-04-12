import { Request, Response } from "express";
import { Category, TResult } from "../../types/common";

export interface CategoryServiceInterface {
  getCategories: () => Promise<TResult<Category[]>>;
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
