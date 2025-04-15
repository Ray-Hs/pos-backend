import { Request, Response } from "express";
import { Table, TResult } from "../../types/common";

export interface TableServiceInterface {
  getTables: () => Promise<TResult<Table[]>>;
  getTableById: (requestId: any) => Promise<TResult<Table>>;
  createTable: (requestData: any) => Promise<TResult<Table>>;
  updateTable: (requestId: any, requestData: any) => Promise<TResult<Table>>;
  deleteTable: (requestId: any) => Promise<TResult<Table>>;
}

export interface TableControllerInterface {
  getTables: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Table[]>>>;
  getTableById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Table>>>;
  createTable: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Table>>>;
  updateTable: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Table>>>;
  deleteTable: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Table>>>;
}
