import { Request, Response } from "express";
import { SubcategoryServices } from "../../../domain/subcategory/subcategory.services";
import { SubcategoryControllerInterface } from "../../../domain/subcategory/subcategory.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";

export class SubcategoryController implements SubcategoryControllerInterface {
  async getSubcategories(req: Request, res: Response) {
    const subcategoryInstance = new SubcategoryServices();
    const response = await subcategoryInstance.getSubcategories();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getSubcategoryById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const subcategoryInstance = new SubcategoryServices();
    const response = await subcategoryInstance.getSubcategoryById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createSubcategory(req: Request, res: Response) {
    const data = req.body;
    const subcategoryInstance = new SubcategoryServices();
    const response = await subcategoryInstance.createSubcategory(data);

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateSubcategory(req: Request, res: Response) {
    const data = req.body;
    const id = parseInt(req.params?.id, 10);
    const subcategoryInstance = new SubcategoryServices();
    const response = await subcategoryInstance.updateSubcategory(id, data);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteSubcategory(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const subcategoryInstance = new SubcategoryServices();
    const response = await subcategoryInstance.deleteSubcategory(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
