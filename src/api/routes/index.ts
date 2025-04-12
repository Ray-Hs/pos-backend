import express, { Router } from "express";
import AuthRoutes from "./auth.routes";
import rateLimiter from "../middlewares/limiter.middleware";
import {
  RATE_LIMIT,
  RATE_LIMIT_TIME_WINDOW,
} from "../../infrastructure/utils/constants";
const router: Router = express.Router();

router.use(
  "/auth",
  rateLimiter(RATE_LIMIT, RATE_LIMIT_TIME_WINDOW),
  AuthRoutes
);

export default router;
