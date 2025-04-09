import express, { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";

const router: Router = express.Router();

const controllerInstance = new AuthController();

router.post("/login", asyncRouteHandler(controllerInstance.login));
router.post(
  "/create-account",
  asyncRouteHandler(controllerInstance.createAccount)
);
router.get("/user", asyncRouteHandler(controllerInstance.getUsers));
router.get("/user/:id", asyncRouteHandler(controllerInstance.getUserBasedOnId));
router.delete("/user/:id", asyncRouteHandler(controllerInstance.deleteAccount));
router.patch("/user/:id", asyncRouteHandler(controllerInstance.updateUser));

export default router;
