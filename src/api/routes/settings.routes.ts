import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { BrandController } from "../controllers/settings/branding/brand.controller";
import { CRMController } from "../controllers/settings/crm/crm.controller";
import { PrinterController } from "../controllers/settings/printer/printer.controller";
import {
  hasPermission,
  isAdmin,
  isAuthenticated,
} from "../middlewares/auth.middleware";
const router: Router = express.Router();
const client = new PrinterController();
const brandClient = new BrandController();

// Printers Routes
router.get(
  "/printers",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(client.getPrinters)
);
router.get(
  "/printers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(client.getPrinterById)
);
router.post(
  "/printers/print",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(client.print)
);
router.post(
  "/printers",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_settings_printers")),
  asyncRouteHandler(client.createPrinter)
);
router.patch(
  "/printers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_settings_printers")),
  asyncRouteHandler(client.updatePrinter)
);
router.delete(
  "/printers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_settings_printers")),
  asyncRouteHandler(client.deletePrinter)
);

// Branding Routes
router.get(
  "/brand",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(brandClient.getBrand)
);
router.post(
  "/brand",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(brandClient.createBrand)
);
router.patch(
  "/brand/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(brandClient.updateBrand)
);
router.delete(
  "/brand/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(brandClient.deleteBrand)
);

export default router;
