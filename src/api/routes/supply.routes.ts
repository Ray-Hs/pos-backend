import express, { Router } from "express";
import { asyncMiddlewareHandler, asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import {
  hasPermission,
  isAdmin,
  isAuthenticated,
} from "../middlewares/auth.middleware";
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
  "/storage",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_inventory_read_storage")),
  asyncRouteHandler(controller.getStorage)
);

router.get(
  "/storage/stores",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getStores)
);

router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getSupplyById)
);

router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(controller.createSupply)
);

router.patch(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(controller.updateSupply)
);

router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(controller.deleteSupply)
);

export default router;
