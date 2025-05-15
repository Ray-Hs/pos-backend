import express, { Router } from "express";
import {
  RATE_LIMIT,
  RATE_LIMIT_TIME_WINDOW,
} from "../../infrastructure/utils/constants";
import rateLimiter from "../middlewares/limiter.middleware";
import AuthRoutes from "./auth.routes";
import CategoryRoutes from "./category.routes";
import ImageRoutes from "./images.routes";
import InvoiceRoutes from "./invoice.routes";
import ItemRoutes from "./item.routes";
import OrderRoutes from "./order.routes";
import OrderItemRoutes from "./orderItem.routes";
import SectionRoutes from "./section.routes";
import SubcategoryRoutes from "./subcategory.routes";
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

export default router;
