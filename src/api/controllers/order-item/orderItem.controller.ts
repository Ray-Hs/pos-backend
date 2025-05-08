import { Request, Response } from "express";
import { OrderItemServices } from "../../../domain/order-item/orderItem.services";
import { OrderItemControllerInterface } from "../../../domain/order-item/orderItem.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";

export class OrderItemController implements OrderItemControllerInterface {
  async getOrderItems(req: Request, res: Response) {
    const client = new OrderItemServices();
    const response = await client.getOrderItems();

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }

  async getOrderItemById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const client = new OrderItemServices();
    const response = await client.getOrderItemById(id);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }

  async createOrderItem(req: Request, res: Response) {
    const data = req.body;
    const client = new OrderItemServices();
    const response = await client.createOrderItem(data);

    return res.status(
      response.success ? CREATED_STATUS : response.error?.code || 500
    );
  }

  async updateOrderItem(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const data = req.body;
    const client = new OrderItemServices();
    const response = await client.updateOrderItem(id, data);

    return res.status(
      response.success ? CREATED_STATUS : response.error?.code || 500
    );
  }

  async deleteOrderItem(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const client = new OrderItemServices();
    const response = await client.deleteOrderItem(id);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }
}
