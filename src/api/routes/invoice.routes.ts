import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { InvoiceController } from "../controllers/invoice/invoice.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const invoice = new InvoiceController();

router.get("/", asyncRouteHandler(invoice.getInvoices));
router.get("/:id", asyncRouteHandler(invoice.findInvoice));
router.get("/order/:id", asyncRouteHandler(invoice.findInvoice));
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(invoice.createInvoice)
);
router.put(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(invoice.updateInvoice)
);
router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(invoice.deleteInvoice)
);

export default router;
