import { Request, Response } from "express";
import { SubCategory, TResult } from "../../types/common";

export interface SubcategoryServiceInterface {
  getSubcategories: () => Promise<TResult<SubCategory[]>>;
  getSubcategoryById: (requestId: any) => Promise<TResult<SubCategory>>;
  createSubcategory: (requestData: any) => Promise<TResult<SubCategory>>;
  updateSubcategory: (
    requestId: any,
    requestData: any
  ) => Promise<TResult<SubCategory>>;
  deleteSubcategory: (requestId: any) => Promise<TResult<SubCategory>>;
}

export interface SubcategoryControllerInterface {
  getSubcategories: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<SubCategory[]>>>;
  getSubcategoryById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<SubCategory>>>;
  createSubcategory: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<SubCategory>>>;
  updateSubcategory: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<SubCategory>>>;
  deleteSubcategory: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<SubCategory>>>;
}
