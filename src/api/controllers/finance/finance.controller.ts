import { Request, Response } from "express";
import { FinanceServices } from "../../../domain/finance/finance.services";
import { FinanceControllerInterface } from "../../../domain/finance/finance.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";

export class FinanceController implements FinanceControllerInterface {
  async listCompanyDebts(req: Request, res: Response) {
    const financeInstance = new FinanceServices();
    const response = await financeInstance.listCompanyDebts();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCompanyDebtById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const financeInstance = new FinanceServices();
    const response = await financeInstance.getCompanyDebtById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createCompanyDebt(req: Request, res: Response) {
    const body = req.body;
    const financeInstance = new FinanceServices();
    const response = await financeInstance.createCompanyDebt(body);

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateCompanyDebt(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const body = req.body;
    const financeInstance = new FinanceServices();
    const response = await financeInstance.updateCompanyDebt(id, body);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteCompanyDebt(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const financeInstance = new FinanceServices();
    const response = await financeInstance.deleteCompanyDebt(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
