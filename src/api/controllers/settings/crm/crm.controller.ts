import { Request, Response } from "express";
import { CRMServices } from "../../../../domain/settings/crm/crm.services";
import { CRMControllerInterface } from "../../../../domain/settings/crm/crm.types";
import {
  OK_STATUS,
  CREATED_STATUS,
} from "../../../../infrastructure/utils/constants";
import logger from "../../../../infrastructure/utils/logger";

export class CRMController implements CRMControllerInterface {
  async getCustomers(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);
    const q = req.query.q as string;
    const crmService = new CRMServices();
    const response = await crmService.getCustomers({ page, limit }, q);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCustomerDebts(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);
    const crmService = new CRMServices();
    const response = await crmService.getCustomerDebts({ page, limit });
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCustomerByPhone(req: Request, res: Response) {
    const crmService = new CRMServices();
    const response = await crmService.getCustomerByPhone(req.params.phone);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCustomerById(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.getCustomerById(id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createCustomer(req: Request, res: Response) {
    const crmService = new CRMServices();
    const response = await crmService.createCustomer(req.body);
    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateCustomer(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.updateCustomer(req.body, id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteCustomer(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.deleteCustomer(id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCompanies(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);
    const crmService = new CRMServices();
    const response = await crmService.getCompanies({ page, limit });
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCompanyById(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.getCompanyById(id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createCompany(req: Request, res: Response) {
    const crmService = new CRMServices();
    const response = await crmService.createCompany(req.body);
    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateCompany(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.updateCompany(req.body, id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteCompany(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.deleteCompany(id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCustomerDiscounts(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string, 10);
    const page = parseInt(req.query.page as string, 10);
    const isActive = req.query.isActive
      ? Boolean(req.query.isActive === "true")
      : undefined;
    const crmService = new CRMServices();
    logger.info(isActive);
    const response = await crmService.getCustomerDiscounts(
      { isActive, page },
      { page, limit }
    );
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCustomerDiscountById(req: Request, res: Response) {
    const isActive = Boolean(req.query.isActive);
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.getCustomerDiscountById(id, { isActive });
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createCustomerDiscount(req: Request, res: Response) {
    const crmService = new CRMServices();
    const response = await crmService.createCustomerDiscount(req.body);
    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateCustomerDiscount(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.updateCustomerDiscount(req.body, id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async changeCustomerDiscount(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const { discount } = req.body;
    const response = await crmService.updateCustomerDiscount({ discount }, id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteCustomerDiscount(req: Request, res: Response) {
    const crmService = new CRMServices();
    const id = parseInt(req.params.id, 10);
    const response = await crmService.deleteCustomerDiscount(id);
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createCustomerPayment(req: Request, res: Response) {
    const crmService = new CRMServices();
    const response = await crmService.createCustomerPayment({
      ...req.body,
      paymentDate: new Date(req.body.paymentDate),
    });
    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getCustomerPayments(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);
    const crmService = new CRMServices();
    const response = await crmService.getCustomerPayments({ limit, page });
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
