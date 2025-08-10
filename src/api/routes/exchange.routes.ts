import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { ExchangeRateController } from "../controllers/exchange/exchange.controller";
import { hasPermission, isAuthenticated } from "../middlewares/auth.middleware";

const router: Router = express.Router();
const exchangeInstance = new ExchangeRateController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(exchangeInstance.getExchangeRates)
);
router.get(
  "/latest",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(exchangeInstance.getLatestExchangeRate)
);
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(hasPermission("manage_finance_daily_exchange_rate")),
  asyncRouteHandler(exchangeInstance.createExchangeRate)
);

export default router;
