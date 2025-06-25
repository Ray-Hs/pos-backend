import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";
import { FinanceController } from "../controllers/finance/finance.controller";

const router: Router = express.Router();
const controller = new FinanceController();

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

export default router;
