import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "./infrastructure/utils/logger";
import { PrismaClient } from "@prisma/client";
import SERVER_CONFIG from "./config/server.config";
import routes from "./api/routes/routes";
const app = express();
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const prisma = new PrismaClient();
app.get("/health", (req: Request, res: Response) => {
  try {
    logger.error("Hello there!");
    res.status(200).json({
      ok: true,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.use(SERVER_CONFIG.API_PREFIX, routes);

export default app;
