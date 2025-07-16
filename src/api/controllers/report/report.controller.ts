// src/controllers/report.controller.ts
import { Request, Response } from "express";
import { DeletedOrderItem } from "@prisma/client";
import ReportService from "../../../domain/report/report.services";
import { ReportControllerInterface } from "../../../domain/report/report.types";
import { TResult } from "../../../types/common";

const reportService = new ReportService();

class ReportController implements ReportControllerInterface {
  async getCloseDayReport(req: Request, res: Response) {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;
    const result = await reportService.getCloseDayReport(fromDate, toDate);
    const status = result.success ? 200 : result.error?.code || 500;
    return res.status(status).json(result);
  }

  async getDailyReport(req: Request, res: Response) {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;
    const result = await reportService.getDailyReport(fromDate, toDate);
    const status = result.success ? 200 : result.error?.code || 500;
    return res.status(status).json(result);
  }

  async getCompanyReport(req: Request, res: Response) {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;
    const result = await reportService.getCompanyReport(fromDate, toDate);
    const status = result.success ? 200 : result.error?.code || 500;
    return res.status(status).json(result);
  }

  async getEmployeeReport(req: Request, res: Response) {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;
    const result = await reportService.getEmployeeReport(fromDate, toDate);
    const status = result.success ? 200 : result.error?.code || 500;
    return res.status(status).json(result);
  }

  async getDeletedItemsReport(req: Request, res: Response) {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;
    const result = await reportService.getDeletedItemsReport(fromDate, toDate);
    const status = result.success ? 200 : result.error?.code || 500;
    return res.status(status).json(result);
  }
}

export default new ReportController();
