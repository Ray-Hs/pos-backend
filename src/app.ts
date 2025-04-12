import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import Routes from "./api/routes";
const app = express();
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", Routes);

export default app;
