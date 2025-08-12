import express, { Router } from "express";
import {
  asyncMiddlewareHandler,
  asyncRouteHandler,
} from "../../infrastructure/utils/asyncRouteHandler";
import { FinanceController } from "../controllers/finance/finance.controller";
import { InvoiceController } from "../controllers/invoice/invoice.controller";
import { CRMController } from "../controllers/settings/crm/crm.controller";
import { hasPermission, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const controller = new FinanceController();
const client = new CRMController();
const invoice = new InvoiceController();
// Customer Debts
router.get(
  "/customer-debts",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_customer_debts")),
  asyncRouteHandler(client.getCustomerDebts)
);

// Invoice
router.get("/invoices", asyncRouteHandler(invoice.showcaseInvoices));

// Customer Payments
router.get(
  "/customer-payments/customers",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCustomers)
);
router.get(
  "/customer-payments/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getPaymentByCustomerId)
);
router.post(
  "/customer-payments",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_customer_payments")),
  asyncRouteHandler(client.createCustomerPayment)
);

router.delete(
  "/customer-payments/:id",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_customer_payments")),
  asyncRouteHandler(client.deleteCustomerPayment)
);
// Company Debts
router.get(
  "/company-debts",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.listCompanyDebts)
);
router.get(
  "/company-debts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getCompanyDebtById)
);
router.post(
  "/company-debts",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_company_debts")),
  asyncRouteHandler(controller.createCompanyDebt)
);
router.patch(
  "/company-debts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_company_debts")),
  asyncRouteHandler(controller.updateCompanyDebt)
);
router.delete(
  "/company-debts/:id",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_company_debts")),
  asyncRouteHandler(controller.deleteCompanyDebt)
);

// Payments
router.get(
  "/payments",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.listPayments)
);
router.get(
  "/payments/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(controller.getPaymentById)
);
router.post(
  "/payments",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_company_payments_tab")),
  asyncRouteHandler(controller.createPayment)
);
router.patch(
  "/payments/:id",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_company_payments_tab")),
  asyncRouteHandler(controller.updatePayment)
);
router.delete(
  "/payments/:id",
  asyncRouteHandler(isAuthenticated),
  asyncMiddlewareHandler(hasPermission("manage_finance_company_payments_tab")),
  asyncRouteHandler(controller.deletePayment)
);

export default router;
