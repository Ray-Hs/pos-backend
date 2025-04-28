import express, { Router } from "express";
import { MenuItemController } from "../controllers/storage/item.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const MenuItemInstance = new MenuItemController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(MenuItemInstance.getItems)
);
router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(MenuItemInstance.getItemById)
);
router.get(
  "/search/:q",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(MenuItemInstance.searchItems)
);
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(MenuItemInstance.createItem)
);
router.put(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(MenuItemInstance.updateItem)
);
router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(MenuItemInstance.deleteItem)
);

export default router;
