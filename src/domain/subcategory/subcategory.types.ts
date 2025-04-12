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
