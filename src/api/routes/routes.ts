import express, { Request, Response, Router } from "express";
import authRoutes from "./auth.routes";
const router: Router = express.Router();

// handling authentication
router.use("/auth", authRoutes);

export default router;
