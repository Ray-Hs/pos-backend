import { Request, Response } from "express";
import {
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import {
  CombinedCurrencyPricing,
  CompanyPricingSummary,
  FinanceControllerInterface,
} from "./finance.types";
import { TResult } from "../../types/common";
import { FinanceServices } from "./finance.services";

export class FinanceController implements FinanceControllerInterface {
  private financeServices: FinanceServices;

  constructor() {
    this.financeServices = new FinanceServices();
  }

  // Company Debt methods
  async createCompanyDebt(
    req: Request,
    res: Response
  ): Promise<Response<TResult<any>>> {
    try {
      const result = await this.financeServices.createCompanyDebt(req.body);
      return res.status(result.success ? 201 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Create Company Debt Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async getCompanyDebtById(
    req: Request,
    res: Response
  ): Promise<Response<TResult<any>>> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid ID",
          },
        });
      }

      const result = await this.financeServices.getCompanyDebtById(id);
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Get Company Debt By ID Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async updateCompanyDebt(
    req: Request,
    res: Response
  ): Promise<Response<TResult<null>>> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid ID",
          },
        });
      }

      const result = await this.financeServices.updateCompanyDebt(id, req.body);
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Update Company Debt Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async deleteCompanyDebt(
    req: Request,
    res: Response
  ): Promise<Response<TResult<null>>> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid ID",
          },
        });
      }

      const result = await this.financeServices.deleteCompanyDebt(id);
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Delete Company Debt Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async listCompanyDebts(
    req: Request,
    res: Response
  ): Promise<Response<TResult<any[]>>> {
    try {
      const { fromDate, toDate } = req.query;
      const result = await this.financeServices.listCompanyDebts({
        fromDate: fromDate as string,
        toDate: toDate as string,
      });
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("List Company Debts Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async getALLCompanyDebts(
    req: Request,
    res: Response
  ): Promise<Response<TResult<any[]>>> {
    try {
      const result = await this.financeServices.getAllCompanyDebts();
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Get All Company Debts Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  // Payment methods
  async createPayment(
    req: Request,
    res: Response
  ): Promise<Response<TResult<any>>> {
    try {
      const result = await this.financeServices.createPayment(req.body);
      return res.status(result.success ? 201 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Create Payment Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async getPaymentById(
    req: Request,
    res: Response
  ): Promise<Response<TResult<any>>> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid ID",
          },
        });
      }

      const result = await this.financeServices.getPaymentById(id);
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Get Payment By ID Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async updatePayment(
    req: Request,
    res: Response
  ): Promise<Response<TResult<null>>> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid ID",
          },
        });
      }

      const result = await this.financeServices.updatePayment(id, req.body);
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Update Payment Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async deletePayment(
    req: Request,
    res: Response
  ): Promise<Response<TResult<null>>> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid ID",
          },
        });
      }

      const result = await this.financeServices.deletePayment(id);
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Delete Payment Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async listPayments(
    req: Request,
    res: Response
  ): Promise<Response<TResult<any[]>>> {
    try {
      const { fromDate, toDate, limit, page } = req.query;
      const result = await this.financeServices.listPayments(
        {
          fromDate: fromDate as string,
          toDate: toDate as string,
        },
        {
          limit: limit ? parseInt(limit as string) : undefined,
          page: page ? parseInt(page as string) : undefined,
        }
      );
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("List Payments Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  // Combined Currency Pricing methods
  async getCompanyCombinedPricing(
    req: Request,
    res: Response
  ): Promise<Response<TResult<CombinedCurrencyPricing>>> {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid company ID",
          },
        });
      }

      const result = await this.financeServices.getCompanyCombinedPricing(companyId);
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Get Company Combined Pricing Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async getAllCompaniesCombinedPricing(
    req: Request,
    res: Response
  ): Promise<Response<TResult<CompanyPricingSummary[]>>> {
    try {
      const result = await this.financeServices.getAllCompaniesCombinedPricing();
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Get All Companies Combined Pricing Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async getCompanyPricingSummary(
    req: Request,
    res: Response
  ): Promise<Response<TResult<CompanyPricingSummary>>> {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid company ID",
          },
        });
      }

      const result = await this.financeServices.getCompanyPricingSummary(companyId);
      return res.status(result.success ? 200 : result.error?.code || 500).json(result);
    } catch (error) {
      logger.error("Get Company Pricing Summary Controller: ", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }
} 