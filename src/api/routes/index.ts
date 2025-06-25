import express, { Router } from "express";
import {
  RATE_LIMIT,
  RATE_LIMIT_TIME_WINDOW,
} from "../../infrastructure/utils/constants";
import rateLimiter from "../middlewares/limiter.middleware";
import AuthRoutes from "./auth.routes";
import CategoryRoutes from "./category.routes";
import ConstantsRoutes from "./constants.routes";
import CRMRoutes from "./crm.routes";
import ExchangeRoutes from "./exchange.routes";
import FinanceRoutes from "./finance.routes";
import ImageRoutes from "./images.routes";
import InvoiceRoutes from "./invoice.routes";
import ItemRoutes from "./item.routes";
import OrderRoutes from "./order.routes";
import OrderItemRoutes from "./orderItem.routes";
import PermissionsRoutes from "./permissions.routes";
import SectionRoutes from "./section.routes";
import SettingsRoutes from "./settings.routes";
import SubcategoryRoutes from "./subcategory.routes";
import SupplyRoutes from "./supply.routes";
import TableRoutes from "./table.routes";
const router: Router = express.Router();

// Auth Routes
router.use(
  "/auth",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  AuthRoutes
);

// Storage Routes
router.use(
  "/storage/category",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  CategoryRoutes
);
router.use(
  "/storage/subcategory",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  SubcategoryRoutes
);
router.use(
  "/storage/item",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  ItemRoutes
);

// Order Routes
router.use(
  "/order/item",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  OrderItemRoutes
);
router.use(
  "/order",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  OrderRoutes
);

// Invoice Routes
router.use(
  "/invoice/constants",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  ConstantsRoutes
);
router.use(
  "/invoice",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  InvoiceRoutes
);

// Section Routes
router.use(
  "/section",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  SectionRoutes
);

// Table Routes
router.use(
  "/table",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  TableRoutes
);

// Image Routes
router.use(
  "/image",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  ImageRoutes
);

// Settings Routes
router.use(
  "/settings",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  SettingsRoutes
);

// CRM Routes
router.use("/crm", rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW), CRMRoutes);

// Supply Routes
router.use(
  "/supply",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  SupplyRoutes
);

// Permissions Routes
router.use(
  "/permissions",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  PermissionsRoutes
);

// Finance Routes
router.use(
  "/finance",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  FinanceRoutes
);

// Exchange Rate Routes
router.use(
  "/exchange",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  ExchangeRoutes
);

export default router;
