import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "./infrastructure/utils/logger";
import { PrismaClient } from "@prisma/client";
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

app.put("/add-data", async (req: Request, res: Response) => {
  const user = await prisma.user.create({
    data: {
      name: "Shyar",
      gender: "FEMALE",
    },
  });

  res.json(user);
});
app.get("/", (req, res) => {
  logger.info("Home route accessed");
  res.send("Hello, Winston!");
});

app.get("/error", (req, res) => {
  logger.error("This is an error log");
  res.status(500).send("Something went wrong!");
});

app.get("/warn", (req, res) => {
  logger.warn("This is a warning log");
  res.send("Warning example");
});

app.get("/health", (req: Request, res: Response) => {
  try {
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

app.get("/api", async (req: Request, res: Response) => {
  try {
    const data = {
      message: "Hello, World!",
    };
    res.json(data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
});

export default app;
