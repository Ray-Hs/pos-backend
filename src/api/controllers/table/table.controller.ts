import { Request, Response } from "express";
import { TableServices } from "../../../domain/table/table.services";
import { TableControllerInterface } from "../../../domain/table/table.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";

export class TableController implements TableControllerInterface {
  async getTables(req: Request, res: Response) {
    const tableServices = new TableServices();
    const response = await tableServices.getTables();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getTableById(req: Request, res: Response) {
    const id = req.params?.id;
    const tableServices = new TableServices();
    const response = await tableServices.getTableById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createTable(req: Request, res: Response) {
    const data = req.body;
    const tableServices = new TableServices();
    const response = await tableServices.createTable(data);

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateTable(req: Request, res: Response) {
    const id = req.params?.id;
    const data = req.body;
    const tableServices = new TableServices();
    const response = await tableServices.updateTable(id, data);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteTable(req: Request, res: Response) {
    const id = req.params?.id;
    const tableServices = new TableServices();
    const response = await tableServices.deleteTable(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
