import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { ExchangeRateController } from "../controllers/exchange/exchange.controller";
import { isAuthenticated } from "../middlewares/auth.middleware";

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
  asyncRouteHandler(exchangeInstance.createExchangeRate)
);

export default router;
