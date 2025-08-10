import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express, { Request, Response } from "express";
import Routes from "./api/routes/index";
import compression from "compression";
import { constants } from "zlib";

// Addition
const app = express();
const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:4173",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://8lm4xlg4-3002.euw.devtunnels.ms",
    "https://8lm4xlg4-4173.euw.devtunnels.ms",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://192.168.43.74:3000",
    "http://192.168.1.12:3000",
    "http://192.168.137.254:3000",
    "http://192.168.137.162:3000",
    "http://192.168.1.249:3000",
    "http://192.168.1.251:3000",
    "http://192.168.1.249:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
// Only compress if Content-Type is text-based
const shouldCompress = (req: Request, res: Response) => {
  const type = res.getHeader("Content-Type")?.toString() || "";
  return /^(?:application\/json|text\/|application\/javascript|text\/css)/.test(
    type
  );
};

app.use(
  compression({
    level: constants.Z_BEST_SPEED, // or Z_DEFAULT_COMPRESSION
    threshold: 1024, // only gzip responses bigger than 1 KB
    filter: shouldCompress,
  })
);
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", Routes);

export default app;
