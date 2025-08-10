import express, { Router } from "express";
import { CRMController } from "../controllers/settings/crm/crm.controller";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import {
  hasPermission,
  isAdmin,
  isAuthenticated,
} from "../middlewares/auth.middleware";

const router: Router = express.Router();
const controller = new CRMController();

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
  asyncRouteHandler(hasPermission("manage_crm_customers")),
  asyncRouteHandler(controller.createCustomer)
);
router.patch(
  "/customers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_crm_customers")),
  asyncRouteHandler(controller.updateCustomer)
);
router.delete(
  "/customers/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_crm_customers")),
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
  asyncRouteHandler(hasPermission("manage_crm_companies")),
  asyncRouteHandler(controller.createCompany)
);
router.patch(
  "/companies/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_crm_companies")),
  asyncRouteHandler(controller.updateCompany)
);
router.delete(
  "/companies/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_crm_companies")),
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
  asyncRouteHandler(hasPermission("manage_crm_customer_discounts")),
  asyncRouteHandler(controller.createCustomerDiscount)
);
router.patch(
  "/customer-discounts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_crm_customer_discounts")),
  asyncRouteHandler(controller.updateCustomerDiscount)
);
router.patch(
  "/customer-discounts/:id/change-discount",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_crm_customer_discounts")),
  asyncRouteHandler(controller.changeCustomerDiscount)
);
router.delete(
  "/customer-discounts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_crm_customer_discounts")),
  asyncRouteHandler(controller.deleteCustomerDiscount)
);

export default router;
