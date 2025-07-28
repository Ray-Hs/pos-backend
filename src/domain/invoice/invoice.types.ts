import { Request, Response } from "express";
import { Invoice, TResult } from "../../types/common";

export interface InvoiceServiceInterface {
  getInvoices: () => Promise<TResult<Invoice[]>>;
  showcaseInvoices: (filterBy?: string) => Promise<TResult<Invoice[]>>;
  groupOrderItems: (orderId: number) => Promise<TResult<any[]>>;
  findInvoice: (requestId: any) => Promise<TResult<Invoice>>;
  findInvoicesByOrderId: (requestId: any) => Promise<TResult<Invoice[]>>;
  createInvoice: (requestData: any) => Promise<TResult<Invoice>>;
  updateInvoice: (
    requestId: any,
    requestData: any
  ) => Promise<TResult<Invoice>>;
  deleteInvoice: (requestId: any) => Promise<TResult<Invoice>>;
}

export interface InvoiceControllerInterface {
  getInvoices: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Invoice[]>>>;
  showcaseInvoices: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Invoice[]>>>;
  groupOrderItems: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<any[]>>>;
  findInvoice: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Invoice>>>;
  findInvoicesByOrderId: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Invoice[]>>>;
  createInvoice: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Invoice>>>;
  updateInvoice: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Invoice>>>;
  deleteInvoice: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Invoice>>>;
}
