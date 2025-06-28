import { Request, Response } from "express";
import { SupplyServices } from "../../../domain/supply/supply.services";
import { SupplyControllerInterface } from "../../../domain/supply/supply.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import { decodeJWT } from "../../../infrastructure/utils/decodeJWT";

export class SupplyController implements SupplyControllerInterface {
  async getSupplies(req: Request, res: Response) {
    const q = req.query.q;
    const supplyService = new SupplyServices();
    const response = await supplyService.getSupplies(q?.toString() || "");

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getSupplyById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const supplyService = new SupplyServices();
    const response = await supplyService.getSupplyById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createSupply(req: Request, res: Response) {
    const supplyService = new SupplyServices();
    const user = decodeJWT(req, res);
    const response = await supplyService.createSupply({
      ...req.body,
      userId: user?.id,
      expiryDate: new Date(req.body.expiryDate),
      purchasedAt: new Date(req.body.purchasedAt),
    });

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateSupply(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const supplyService = new SupplyServices();
    const response = await supplyService.updateSupply(
      {
        ...req.body,
        expiryDate: new Date(req.body.expiryDate),
        purchasedAt: new Date(req.body.purchasedAt),
      },
      id
    );

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteSupply(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const supplyService = new SupplyServices();
    const response = await supplyService.deleteSupply(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
