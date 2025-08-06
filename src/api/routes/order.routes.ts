import express, { Router } from "express";
import { OrderController } from "../controllers/table/order.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";
import { InvoiceController } from "../controllers/invoice/invoice.controller";

const router: Router = express.Router();
const orderController = new OrderController();
const invoiceController = new InvoiceController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(orderController.getOrders)
);
router.get(
  "/invoice",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(invoiceController.getInvoiceRefById)
);
router.get(
  "/latest/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(orderController.getLatestOrder)
);
router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(orderController.getOrderById)
);
router.get(
  "/table/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(orderController.getOrderByTableId)
);
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(orderController.createOrder)
);
router.patch(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(orderController.updateOrder)
);
router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(orderController.deleteOrder)
);
router.post(
  "/cancel/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(orderController.cancelOrder)
);

export default router;
