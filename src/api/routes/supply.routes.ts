import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";
import { SupplyController } from "../controllers/supply/supply.controller";

const router: Router = express.Router();
const controller = new SupplyController();

// Supplies Routes
router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getSupplies)
);

router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getSupplyById)
);

router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.createSupply)
);

router.patch(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.updateSupply)
);

router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.deleteSupply)
);

export default router;
