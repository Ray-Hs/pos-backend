import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";
import { FinanceController } from "../controllers/finance/finance.controller";
import { CRMController } from "../controllers/settings/crm/crm.controller";

const router: Router = express.Router();
const controller = new FinanceController();
const client = new CRMController();

// Customer Debts
router.get(
  "/customer-debts",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(client.getCustomerDebts)
);

// Company Debts
router.get(
  "/company-debts",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.listCompanyDebts)
);
router.get(
  "/company-debts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCompanyDebtById)
);
router.post(
  "/company-debts",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.createCompanyDebt)
);
router.patch(
  "/company-debts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.updateCompanyDebt)
);
router.delete(
  "/company-debts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.deleteCompanyDebt)
);

// Payments
router.get(
  "/payments",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.listPayments)
);
router.get(
  "/payments/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getPaymentById)
);
router.post(
  "/payments",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.createPayment)
);
router.patch(
  "/payments/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.updatePayment)
);
router.delete(
  "/payments/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.deletePayment)
);

export default router;
