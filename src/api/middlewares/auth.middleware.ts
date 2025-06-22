import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { findUserDB } from "../../domain/auth/auth.repository";
import {
  FORBIDDEN_ERR,
  FORBIDDEN_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  INVALID_TOKEN_ERR,
  INVALID_TOKEN_STATUS,
  NO_TOKEN_ERR,
  NO_TOKEN_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
  UNAUTHORIZED_ERR,
  UNAUTHORIZED_STATUS,
} from "../../infrastructure/utils/constants";
import { decodeJWT } from "../../infrastructure/utils/decodeJWT";
import logger from "../../infrastructure/utils/logger";
import { User } from "../../types/common";
import ms from "ms";
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
    const token = await req.cookies?.session;

    if (!token)
      return res.status(NO_TOKEN_STATUS).json({
        success: false,
        error: {
          code: NO_TOKEN_STATUS,
          message: NO_TOKEN_ERR,
        },
      });

    const session = decodeJWT(req, res) as JwtPayload & User;

    if (
      session?.username === undefined ||
      session?.role === undefined ||
      session?.id === undefined
    ) {
      logger.warn(
        JSON.stringify({
          "Username: ": session?.username,
          "Role: ": session?.role,
          "ID: ": session?.id,
        })
      );
      return res.status(UNAUTHORIZED_STATUS).json({
        success: false,
        error: {
          code: UNAUTHORIZED_STATUS,
          message: UNAUTHORIZED_ERR,
        },
      });
    }

    const userExists = await findUserDB(session?.id);

    if (!userExists)
      return res.status(NOT_FOUND_STATUS).json({
        success: false,
        error: {
          code: NOT_FOUND_STATUS,
          message: NOT_FOUND_ERR,
        },
      });

    jwt.verify(token, SECRET_KEY as string, (err: any, user: any) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          res.cookie("session", "", {
            maxAge: ms("1s"),
          });
          return res.status(INVALID_TOKEN_STATUS).json({
            success: false,
            error: {
              code: INVALID_TOKEN_STATUS,
              message: INVALID_TOKEN_ERR,
            },
          });
        } else {
          return res.status(UNAUTHORIZED_STATUS).json({
            success: false,
            error: {
              code: UNAUTHORIZED_STATUS,
              message: UNAUTHORIZED_ERR,
            },
          });
        }
      }

      req.user = userExists;
      next();
    });
  } catch (error) {
    logger.error("Authenticated middleware: ", error);
    return res.status(INTERNAL_SERVER_STATUS).json({
      error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
    });
  }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = (req.user as User) || {};

    if (role?.name !== "ADMIN") {
      return res.status(FORBIDDEN_STATUS).json({
        success: false,
        error: {
          code: FORBIDDEN_STATUS,
          message: FORBIDDEN_ERR,
        },
      });
    }

    next();
  } catch (error) {
    logger.error("Admin Middleware: ", error);
    res.status(INTERNAL_SERVER_STATUS).json({
      error: {
        code: INTERNAL_SERVER_STATUS,
        message: INTERNAL_SERVER_ERR,
      },
    });
  }
}

export function hasPermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as User | undefined;

      if (!user || !user.role || !Array.isArray(user.role.permissions)) {
        return res.status(FORBIDDEN_STATUS).json({
          success: false,
          error: {
            code: FORBIDDEN_STATUS,
            message: FORBIDDEN_ERR,
          },
        });
      }

      if (!user.role.permissions.some((perm) => perm.key === permission)) {
        return res.status(FORBIDDEN_STATUS).json({
          success: false,
          error: {
            code: FORBIDDEN_STATUS,
            message: FORBIDDEN_ERR,
          },
        });
      }

      next();
    } catch (error) {
      logger.error("Permission Middleware: ", error);
      res.status(INTERNAL_SERVER_STATUS).json({
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  };
}
