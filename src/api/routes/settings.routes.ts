import express, { Router } from "express";
import { PrinterController } from "../controllers/settings/printer/printer.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";
import { BrandController } from "../controllers/settings/branding/brand.controller";
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
  "/printers/:id/print",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(client.print)
);
router.post(
  "/printers",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(client.createPrinter)
);
router.patch(
  "/printers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(client.updatePrinter)
);
router.delete(
  "/printers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
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
