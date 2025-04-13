import express, { Router } from "express";
import {
  RATE_LIMIT,
  RATE_LIMIT_TIME_WINDOW,
} from "../../infrastructure/utils/constants";
import rateLimiter from "../middlewares/limiter.middleware";
import AuthRoutes from "./auth.routes";
import CategoryRoutes from "./category.routes";
import ItemRoutes from "./item.routes";
import SubcategoryRoutes from "./subcategory.routes";
const router: Router = express.Router();

router.use(
  "/auth",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  AuthRoutes
);
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

export default router;
