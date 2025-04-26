import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";
import { ImageController } from "../controllers/images/images.controller";

const router: Router = express.Router();
const imageController = new ImageController();
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(imageController.uploadImage)
);
router.delete(
  "/:url",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(imageController.deleteImage)
);

export default router;
