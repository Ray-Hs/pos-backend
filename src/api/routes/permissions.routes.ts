import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { PermissionsController } from "../controllers/permissions/permissions.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const permissions = new PermissionsController();

router.get(
  "/role",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(permissions.getUserRoles)
);
router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(permissions.getPermissions)
);

router.get(
  "/role/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(permissions.getUserRoleById)
);

router.post(
  "/role",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(permissions.createUserRole)
);

router.patch(
  "/role/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(permissions.updateUserRole)
);

router.delete(
  "/role/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(permissions.deleteUserRole)
);

export default router;
