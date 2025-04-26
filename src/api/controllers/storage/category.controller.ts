import { Request, Response } from "express";
import { CategoryServices } from "../../../domain/category/category.services";
import { CategoryControllerInterface } from "../../../domain/category/category.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import { Filter } from "../../../types/common";
import logger from "../../../infrastructure/utils/logger";

export class CategoryController implements CategoryControllerInterface {
  async getCategories(req: Request, res: Response) {
    const filter = req.query?.sort as Filter;
    logger.info("Filter: ", filter);
    const categoryInstance = new CategoryServices();
    const data = await categoryInstance.getCategories(filter);
    return res
      .status(data.success ? OK_STATUS : data.error?.code || 500)
      .json(data);
  }

  async getCategoryById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const categoryInstance = new CategoryServices();
    const data = await categoryInstance.findCategoryById(id);
    return res
      .status(data.success ? OK_STATUS : data.error?.code || 500)
      .json(data);
  }

  async createCategory(req: Request, res: Response) {
    const dataRequest = req.body;
    const categoryInstance = new CategoryServices();
    const data = await categoryInstance.createCategory(dataRequest);
    return res
      .status(data.success ? CREATED_STATUS : data.error?.code || 500)
      .json(data);
  }

  async updateCategory(req: Request, res: Response) {
    const idRequest = parseInt(req.params?.id, 10);
    const dataRequest = req.body;
    const categoryInstance = new CategoryServices();
    const data = await categoryInstance.updateCategory(idRequest, dataRequest);
    return res
      .status(data.success ? OK_STATUS : data.error?.code || 500)
      .json(data);
  }

  async deleteCategory(req: Request, res: Response) {
    const idRequest = parseInt(req.params?.id, 10);
    const categoryInstance = new CategoryServices();
    const data = await categoryInstance.deleteCategory(idRequest);
    return res
      .status(data.success ? OK_STATUS : data.error?.code || 500)
      .json(data);
  }
}
