import jwt, { Secret } from "jsonwebtoken";
import ms from "ms";
import { User } from "../../types/common";
import { JWT_EXPIRE } from "./constants";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function createJWT(
  username: string | null,
  id: number,
  role: User["role"],
  isActive: boolean,
  expires: number = ms(JWT_EXPIRE)
) {
  return jwt.sign(
    {
      username: username,
      id: id, // Include user id in the payload
      role: role,
      isActive,
      iat: Math.floor(Date.now() / 1000), // Convert to seconds
    },
    SECRET_KEY as Secret,
    { expiresIn: expires / 1000 }
  );
}
