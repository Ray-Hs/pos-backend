import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../../types/common";

export interface DecodedJWT extends Omit<User, "password"> {
  iat?: number;
  exp?: number;
}

export const decodeJWT = (req: Request, res: Response): DecodedJWT | null => {
  const token = req.cookies?.session;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedJWT;

    return {
      id: decoded.id,
      username: decoded.username,
      isActive: decoded.isActive,
      role: decoded.role,
    };
  } catch (error) {
    return null;
  }
};
