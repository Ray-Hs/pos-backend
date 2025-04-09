import { Request, Response, NextFunction } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../../infrastructure/database/prisma/client";
import { decodeJWT } from "../../infrastructure/utils/decodeJWT";
dotenv.config();
const SECRET_KEY: string | undefined = process.env.JWT_SECRET_KEY;

//extend the express request with user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({
        message: "'Access token missing or invalid'",
        errorCode: "NOTOK",
      });

    const { email, userId } = decodeJWT(req, res) as JwtPayload;

    if (email === undefined && userId === undefined)
      return res.status(401).json({
        message: "Access not granted",
      });

    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists)
      return res.status(401).json({
        message: "User does not exist",
        errorCode: "UDN",
      });

    jwt.verify(token, SECRET_KEY as string, (err, user: any) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            error: "Token has expired",
            errorCode: "TOKE",
          });
        } else {
          return res.status(401).json({
            error: "You are not authenticated",
            errorCode: "NOTOK",
          });
        }
      }

      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong. " + error,
    });
  }
}
