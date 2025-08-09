import express, { Router } from "express";
import {
  asyncMiddlewareHandler,
  asyncRouteHandler,
} from "../../infrastructure/utils/asyncRouteHandler";
import { ConstantsController } from "../controllers/constants/constants.controller";
import { hasPermission, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const client = new ConstantsController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(client.getConstants)
);
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_settings_constants")),
  asyncRouteHandler(client.createConstants)
);
router.patch(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_settings_constants")),
  asyncRouteHandler(client.updateConstants)
);
router.delete(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_settings_constants")),
  asyncRouteHandler(client.deleteConstants)
);

export default router;
