import { Request, Response } from "express";
import { OrderServices } from "../../../domain/order/order.services";
import { OrderControllerInterface } from "../../../domain/order/order.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";

export class OrderController implements OrderControllerInterface {
  async getOrders(req: Request, res: Response) {
    const orderService = new OrderServices();
    const response = await orderService.getOrders();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getOrderById(req: Request, res: Response) {
    const id = req.params?.id;
    const orderService = new OrderServices();
    const response = await orderService.getOrderById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createOrder(req: Request, res: Response) {
    const body = req.body;
    const orderService = new OrderServices();
    const response = await orderService.createOrder(body);

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateOrder(req: Request, res: Response) {
    const id = req.params?.id;
    const body = req.body;
    const orderService = new OrderServices();
    const response = await orderService.updateOrder(id, body);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteOrder(req: Request, res: Response) {
    const id = req.params?.id;
    const orderService = new OrderServices();
    const response = await orderService.deleteOrder(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
