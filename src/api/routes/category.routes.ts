import express, { Router } from "express";
import { CategoryController } from "../controllers/storage/category.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { hasPermission, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const categoryInstance = new CategoryController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(categoryInstance.getCategories)
);

router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(categoryInstance.getCategoryById)
);

router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(categoryInstance.createCategory)
);

router.patch(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(categoryInstance.updateCategory)
);

router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(categoryInstance.deleteCategory)
);

export default router;
