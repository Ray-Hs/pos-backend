import { Request, Response } from "express";
import { BrandServices } from "../../../../domain/settings/branding/brand.services";
import { BrandControllerInterface } from "../../../../domain/settings/branding/brand.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../../infrastructure/utils/constants";

export class BrandController implements BrandControllerInterface {
  async getBrand(req: Request, res: Response) {
    const brandService = new BrandServices();
    const response = await brandService.getBrand();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createBrand(req: Request, res: Response) {
    const brandService = new BrandServices();
    const response = await brandService.createBrand(req.body);

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }
  async updateBrand(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const brandService = new BrandServices();
    const response = await brandService.updateBrand(req.body, id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
  async deleteBrand(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const brandService = new BrandServices();
    const response = await brandService.deleteBrand(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
