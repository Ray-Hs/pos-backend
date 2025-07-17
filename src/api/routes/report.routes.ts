// src/routes/report.routes.ts
import { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import reportController from "../controllers/report/report.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/close-day",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(reportController.getCloseDayReport)
);
router.get(
  "/daily-report",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(reportController.getDailyReport)
);
router.get(
  "/company-report",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(reportController.getCompanyReport)
);
router.get(
  "/employee-report",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(reportController.getEmployeeReport)
);
router.get(
  "/deleted-items",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(reportController.getDeletedItemsReport)
);

export default router;
