import { Request, Response } from "express";
import { Invoice, Order, TResult } from "../../types/common";

export interface OrderServiceInterface {
  getOrders: () => Promise<TResult<Order[]>>;
  getOrderById: (requestId: any) => Promise<TResult<Order>>;
  getOrderByTableId: (requestId: any) => Promise<TResult<Order>>;
  getLatestOrder: (requestId: any) => Promise<TResult<Order>>;
  createOrder: (
    requestData: any
  ) => Promise<TResult<{ order: Order; invoice: Invoice }>>;
  updateOrder: (
    requestId: any,
    requestData: any
  ) => Promise<TResult<{ order: Order; invoice: Invoice }>>;
  deleteOrder: (requestId: any) => Promise<TResult<void>>;
  cancelOrder: (tableId: any) => Promise<TResult<void>>;
}

export interface OrderControllerInterface {
  getOrders: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Order[]>>>;
  getOrderById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Order>>>;
  getOrderByTableId: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Order>>>;
  getLatestOrder: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Order>>>;
  createOrder: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<{ order: Order; invoice: Invoice }>>>;
  updateOrder: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<{ order: Order; invoice: Invoice }>>>;
  deleteOrder: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  cancelOrder: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
}
