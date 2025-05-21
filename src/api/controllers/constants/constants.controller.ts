import { Request, Response } from "express";
import { ConstantsService } from "../../../domain/constants/constants.services";
import { IConstantController } from "../../../domain/constants/constants.types";
import { OK_STATUS } from "../../../infrastructure/utils/constants";

export class ConstantsController implements IConstantController {
  async getConstants(req: Request, res: Response) {
    const client = new ConstantsService();
    const response = await client.getConstants();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createConstants(req: Request, res: Response) {
    const data = req.body;
    const client = new ConstantsService();
    const response = await client.createConstants(data);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateConstants(req: Request, res: Response) {
    const data = req.body;
    const client = new ConstantsService();
    const response = await client.updateConstants(data);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteConstants(req: Request, res: Response) {
    const data = req.body;
    const client = new ConstantsService();
    const response = await client.deleteConstants(data);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
