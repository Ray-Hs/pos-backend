import { Request, Response } from "express";
import { Order, TResult } from "../../types/common";

export interface OrderServiceInterface {
  getOrders: () => Promise<TResult<Order[]>>;
  getOrderById: (requestId: any) => Promise<TResult<Order>>;
  getOrderByTableId: (requestId: any) => Promise<TResult<Order>>;
  getLatestOrder: (requestId: any) => Promise<TResult<Order>>;
  createOrder: (requestData: any) => Promise<TResult<Order>>;
  updateOrder: (requestId: any, requestData: any) => Promise<TResult<Order>>;
  deleteOrder: (requestId: any) => Promise<TResult<Order>>;
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
  ) => Promise<Response<TResult<Order>>>;
  updateOrder: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Order>>>;
  deleteOrder: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Order>>>;
}
