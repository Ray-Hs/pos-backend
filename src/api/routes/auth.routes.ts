import express, { Router } from "express";
import AuthController from "../controllers/auth/auth.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();

const controllerInstance = new AuthController();

router.post("/login", asyncRouteHandler(controllerInstance.login));
router.get("/logout", asyncRouteHandler(controllerInstance.logout));
router.post(
  "/create-account",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controllerInstance.createAccount)
);
router.get(
  "/user",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controllerInstance.getUsers)
);
router.get(
  "/user/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controllerInstance.getUserBasedOnId)
);
router.delete(
  "/user/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controllerInstance.deleteAccount)
);
router.put(
  "/user/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controllerInstance.updateUser)
);

export default router;
