import { Request, Response } from "express";
import { FinanceServices } from "../../../domain/finance/finance.services";
import { FinanceControllerInterface } from "../../../domain/finance/finance.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import { decodeJWT } from "../../../infrastructure/utils/decodeJWT";
import { CRMServices } from "../../../domain/settings/crm/crm.services";

export class FinanceController implements FinanceControllerInterface {
  async listPayments(req: Request, res: Response) {
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);
    const financeInstance = new FinanceServices();
    const response = await financeInstance.listPayments(
      { fromDate, toDate },
      { page, limit }
    );

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCustomers(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);
    const q = req.query.q as string;
    const financeInstance = new FinanceServices();
    const response = await financeInstance.getCustomers({ page, limit }, q);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getPaymentByCustomerId(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);
    const crmInstance = new CRMServices();
    const response = await crmInstance.getCustomerPayments(id, { page, limit });

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getPaymentById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const financeInstance = new FinanceServices();
    const response = await financeInstance.getPaymentById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getALLCompanyDebts(req: Request, res: Response) {
    const financeInstance = new FinanceServices();
    const response = await financeInstance.getAllCompanyDebts();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createPayment(req: Request, res: Response) {
    const body = req.body;
    const user = decodeJWT(req, res);
    const financeInstance = new FinanceServices();
    const paymentDate = new Date(req.body.paymentDate);
    const response = await financeInstance.createPayment({
      ...body,
      paymentDate,
      userId: user?.id,
    });

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updatePayment(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const user = decodeJWT(req, res);
    const body = req.body;
    const financeInstance = new FinanceServices();
    const response = await financeInstance.updatePayment(id, {
      ...body,
      userId: user?.id,
    });

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deletePayment(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const financeInstance = new FinanceServices();
    const response = await financeInstance.deletePayment(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async listCompanyDebts(req: Request, res: Response) {
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;
    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);
    const financeInstance = new FinanceServices();
    const response = await financeInstance.listCompanyDebts(
      {
        fromDate,
        toDate,
      },
      {
        page,
        limit,
      }
    );

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
    const user = decodeJWT(req, res);
    const response = await financeInstance.createCompanyDebt({
      ...body,
      userId: user?.id,
    });

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateCompanyDebt(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const body = req.body;
    const user = decodeJWT(req, res);
    const financeInstance = new FinanceServices();
    const response = await financeInstance.updateCompanyDebt(id, {
      ...body,
      userId: user?.id,
    });

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
