import { Request, Response } from "express";
import { Table, TResult } from "../../types/common";

export interface TableServiceInterface {
  getTables: () => Promise<TResult<Table[]>>;
  getTableById: (requestId: any) => Promise<TResult<Table>>;
  getTableByName: (requestName: any) => Promise<TResult<Table>>;
  createTable: (
    requestData: any,
    quantity: number,
    sectionId: number
  ) => Promise<TResult<void>>;
  updateTable: (requestId: any, requestData: any) => Promise<TResult<void>>;
  deleteTable: (requestId: any) => Promise<TResult<void>>;
  transferTable: (
    tableIdOne: number,
    tableIdTwo: number
  ) => Promise<TResult<void>>;
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
  getTableByName: (
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
  transferTable: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
}
