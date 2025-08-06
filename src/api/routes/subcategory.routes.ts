import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { SubcategoryController } from "../controllers/storage/subcategory.controller";
import { hasPermission, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const SubcategoryInstance = new SubcategoryController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(SubcategoryInstance.getSubcategories)
);
router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(SubcategoryInstance.getSubcategoryById)
);
router.get(
  "/category/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(SubcategoryInstance.getSubcategoriesByCategoryIdDB)
);

router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(SubcategoryInstance.createSubcategory)
);

router.patch(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(SubcategoryInstance.updateSubcategory)
);

router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory")),
  asyncRouteHandler(SubcategoryInstance.deleteSubcategory)
);

export default router;
