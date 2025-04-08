import jwt from "jsonwebtoken";

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload;
    }
  }
}
