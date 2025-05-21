import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { ConstantsController } from "../controllers/constants/constants.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

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
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(client.createConstants)
);
router.patch(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(client.updateConstants)
);
router.delete(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(client.deleteConstants)
);

export default router;
