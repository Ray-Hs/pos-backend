import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { SubcategoryController } from "../controllers/storage/subcategory.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

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
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(SubcategoryInstance.createSubcategory)
);

router.put(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(SubcategoryInstance.updateSubcategory)
);

router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(SubcategoryInstance.deleteSubcategory)
);

export default router;
