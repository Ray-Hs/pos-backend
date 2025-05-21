import { Request, Response } from "express";
import { OrderItem, TResult } from "../../types/common";

export interface OrderItemServiceInterface {
  getOrderItems: () => Promise<TResult<OrderItem[]>>;
  getOrderItemById: (requestId: any) => Promise<TResult<OrderItem>>;
  createOrderItem: (requestData: any) => Promise<TResult<OrderItem>>;
  updateOrderItem: (requestId: any, requestData: any) => Promise<TResult<void>>;
  deleteOrderItem: (requestId: any) => Promise<TResult<void>>;
}

export interface OrderItemControllerInterface {
  getOrderItems: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<OrderItem[]>>>;
  getOrderItemById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<OrderItem>>>;
  createOrderItem: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  updateOrderItem: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  deleteOrderItem: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
}
