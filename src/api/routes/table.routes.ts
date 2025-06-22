import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { TableController } from "../controllers/table/table.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const tableController = new TableController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(tableController.getTables)
);
router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(tableController.getTableById)
);
router.get(
  "/name/:name",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(tableController.getTableByName)
);
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(tableController.createTable)
);
router.post(
  "/transfer",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(tableController.transferTable)
);
router.patch(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(tableController.updateTable)
);
router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(tableController.deleteTable)
);

export default router;
