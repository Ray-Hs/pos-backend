import { Request, Response } from "express";
import { TableServices } from "../../../domain/table/table.services";
import { TableControllerInterface } from "../../../domain/table/table.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import { TResult } from "../../../types/common";

export class TableController implements TableControllerInterface {
  async getTables(req: Request, res: Response) {
    const tableServices = new TableServices();
    const response = await tableServices.getTables();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getTableById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const tableServices = new TableServices();
    const response = await tableServices.getTableById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getTableByName(req: Request, res: Response) {
    const name = req.params?.name;
    const tableServices = new TableServices();
    const response = await tableServices.getTableByName(name);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createTable(req: Request, res: Response) {
    const data = req.body;
    const sectionId = parseInt(req.query?.sectionId as string, 10);
    const quantity = parseInt(req.query?.quantity as string, 10);
    const tableServices = new TableServices();
    const response = await tableServices.createTable(
      data,
      quantity || 1,
      sectionId
    );

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateTable(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const data = req.body;
    const tableServices = new TableServices();
    const response = await tableServices.updateTable(id, data);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteTable(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const tableServices = new TableServices();
    const response = await tableServices.deleteTable(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async transferTable(req: Request, res: Response) {
    const idOne = parseInt(req.params?.idOne, 10);
    const idTwo = parseInt(req.params?.idTwo, 10);
    const tableServices = new TableServices();
    const response = await tableServices.transferTable(idOne, idTwo);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
