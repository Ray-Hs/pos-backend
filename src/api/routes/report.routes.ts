// src/routes/report.routes.ts
import { Router } from "express";
import { asyncMiddlewareHandler, asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import reportController from "../controllers/report/report.controller";
import {
  hasPermission,
  isAdmin,
  isAuthenticated,
} from "../middlewares/auth.middleware";

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
  asyncMiddlewareHandler(hasPermission("manage_reports_end_of_day")),
  asyncRouteHandler(reportController.getDailyReport)
);
router.get(
  "/company-report",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_reports_general_reports")),
  asyncRouteHandler(reportController.getCompanyReport)
);
router.get(
  "/employee-report",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_reports_general_reports")),
  asyncRouteHandler(reportController.getEmployeeReport)
);
router.get(
  "/deleted-items",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_reports_deleted_order_items")),
  asyncRouteHandler(reportController.getDeletedItemsReport)
);

export default router;
