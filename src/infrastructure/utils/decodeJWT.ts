import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface DecodedJWT {
  email: string;
  userId: number;
  iat?: number;
  exp?: number;
}

export const decodeJWT = (req: Request, res: Response): DecodedJWT | null => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedJWT;

    return {
      email: decoded.email,
      userId: decoded.userId,
    };
  } catch (error) {
    return null;
  }
};
