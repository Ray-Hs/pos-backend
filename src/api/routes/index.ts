import express, { Router } from "express";
import AuthRoutes from "./auth.routes";
const router: Router = express.Router();

router.use("/auth", AuthRoutes);

export default router;
