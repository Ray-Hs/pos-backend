import { Request, Response } from "express";
import { OrderServices } from "../../../domain/order/order.services";
import { OrderControllerInterface } from "../../../domain/order/order.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import { decodeJWT } from "../../../infrastructure/utils/decodeJWT";
import { UserWithoutPassword } from "../../../types/common";

export class OrderController implements OrderControllerInterface {
  async getOrders(req: Request, res: Response) {
    const orderService = new OrderServices();
    const response = await orderService.getOrders();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getOrderById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const orderService = new OrderServices();
    const response = await orderService.getOrderById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getOrderByTableId(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const orderService = new OrderServices();
    const response = await orderService.getOrderByTableId(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getLatestOrder(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const orderService = new OrderServices();
    const response = await orderService.getLatestOrder(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createOrder(req: Request, res: Response) {
    const body = req.body;
    const userId = decodeJWT(req, res) as UserWithoutPassword;
    const orderService = new OrderServices();
    const response = await orderService.createOrder({
      ...body,
      userId: userId.id,
    });

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateOrder(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const body = req.body;
    const userId = decodeJWT(req, res) as UserWithoutPassword;
    const orderService = new OrderServices();
    console.log(JSON.stringify(body));
    const response = await orderService.updateOrder(id, {
      ...body,
      userId: userId.id,
    });

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteOrder(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const orderService = new OrderServices();
    const response = await orderService.deleteOrder(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async cancelOrder(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const cancellationReason = req.params.cancellationReason || "";
    const user = decodeJWT(req, res) as UserWithoutPassword;

    const orderService = new OrderServices();
    const response = await orderService.cancelOrder(
      id,
      user,
      cancellationReason.toString()
    );

    return res.status(response.success ? OK_STATUS : 500).json(response);
  }
}
