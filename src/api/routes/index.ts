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
import LocalImageRoutes from "./local-images.routes";
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
import ReportsRoutes from "./report.routes";
import path from "path";
import fs from "fs";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import logger from "../../infrastructure/utils/logger";
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
router.use(
  "/local-image",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  LocalImageRoutes
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

// Report Routes
router.use(
  "/report",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  ReportsRoutes
);
// Static file serving endpoint for images - serve by full URL path
router.get(
  "/*",
  asyncRouteHandler(async (req: express.Request, res: express.Response) => {
    try {
      // Get the full path after /api/images/
      let imagePath = req.params[0].replace(/^\/+|\/+$/g, ""); // This gets everything after the wildcard
      console.log("raw params[0] =", JSON.stringify(req.params[0]));
      console.log("split parts    =", req.params[0].split("/"));

      if (!imagePath) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: "Image path is required",
          },
        });
      }

      // Split path to get imageId and filename
      const pathParts = imagePath.split("/");
      if (pathParts.length !== 3) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: "Invalid image path format. Expected: imageId/filename",
          },
        });
      }

      const imageId = pathParts[1];
      const filename = pathParts[2];
      console.table([imageId, filename]);

      // Construct file path
      const uploadsDir = path.join(
        process.cwd(),
        "backend",
        "uploads",
        "images"
      );
      const fullImagePath = path.join(uploadsDir, imageId, filename);

      // Check if file exists
      if (!fs.existsSync(fullImagePath)) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: "Image not found",
          },
        });
      }

      // Read metadata to get mime type
      const metadataPath = path.join(uploadsDir, imageId, "metadata.json");
      let mimeType = "image/jpeg"; // default

      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
          mimeType = metadata.mimetype || "image/jpeg";
        } catch (error) {
          logger.warn("Failed to read metadata, using default mime type");
        }
      }

      // Set appropriate headers
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

      // Send file
      res.sendFile(fullImagePath);
    } catch (error) {
      logger.error("Error serving image:", error);
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "Internal server error while serving image",
        },
      });
    }
  })
);
export default router;
