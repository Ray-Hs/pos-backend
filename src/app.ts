import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express from "express";
import Routes from "./api/routes";
const app = express();
const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://192.168.43.74:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", Routes);

export default app;
