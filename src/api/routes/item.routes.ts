import express, { Router } from "express";
import { MenuItemController } from "../controllers/storage/item.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import {
  hasPermission,
  isAdmin,
  isAuthenticated,
} from "../middlewares/auth.middleware";

const router: Router = express.Router();
const MenuItemInstance = new MenuItemController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(MenuItemInstance.getItems)
);
router.get(
  "/search",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(MenuItemInstance.searchItems)
);
router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(MenuItemInstance.getItemById)
);
router.get(
  "/category/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(MenuItemInstance.getItemsByCategory)
);
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory_add_menu_items")),
  asyncRouteHandler(MenuItemInstance.createItem)
);
router.patch(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory_menu_items")),
  asyncRouteHandler(MenuItemInstance.updateItem)
);
router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_inventory_menu_items")),
  asyncRouteHandler(MenuItemInstance.deleteItem)
);

export default router;
