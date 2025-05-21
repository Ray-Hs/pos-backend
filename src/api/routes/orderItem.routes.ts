import express, { Router } from "express";
import { OrderItemController } from "../controllers/order-item/orderItem.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

const client = new OrderItemController();
const router: Router = express.Router();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(client.getOrderItems)
);
router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(client.getOrderItemById)
);
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(client.createOrderItem)
);
router.patch(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(client.updateOrderItem)
);
router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(client.deleteOrderItem)
);

export default router;
