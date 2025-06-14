import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { BrandController } from "../controllers/settings/branding/brand.controller";
import { CRMController } from "../controllers/settings/crm/crm.controller";
import { PrinterController } from "../controllers/settings/printer/printer.controller";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";
const router: Router = express.Router();
const client = new PrinterController();
const brandClient = new BrandController();
const controller = new CRMController();

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

// Customers
router.get(
  "/customers",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCustomers)
);
router.get(
  "/customers/phone/:phone",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCustomerByPhone)
);
router.get(
  "/customers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCustomerById)
);
router.post(
  "/customers",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.createCustomer)
);
router.patch(
  "/customers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.updateCustomer)
);
router.delete(
  "/customers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.deleteCustomer)
);

// Companies
router.get(
  "/companies",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCompanies)
);
router.get(
  "/companies/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCompanyById)
);
router.post(
  "/companies",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.createCompany)
);
router.patch(
  "/companies/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.updateCompany)
);
router.delete(
  "/companies/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.deleteCompany)
);

// Customer Discounts
router.get(
  "/customer-discounts",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCustomerDiscounts)
);
router.get(
  "/customer-discounts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCustomerDiscountById)
);
router.post(
  "/customer-discounts",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.createCustomerDiscount)
);
router.patch(
  "/customer-discounts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.updateCustomerDiscount)
);
router.delete(
  "/customer-discounts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(controller.deleteCustomerDiscount)
);

export default router;
//? Export
