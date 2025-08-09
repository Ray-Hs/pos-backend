import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import ms from "ms";
import AuthService from "../../../domain/auth/auth.services";
import { AuthControllerInterface } from "../../../domain/auth/auth.types";
import prisma from "../../../infrastructure/database/prisma/client";
import {
  CREATED_STATUS,
  INTERNAL_SERVER_STATUS,
  JWT_EXPIRE,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import { decodeJWT } from "../../../infrastructure/utils/decodeJWT";
import { UserWithoutPassword } from "../../../types/common";

class AuthController implements AuthControllerInterface {
  async login(req: Request, res: Response) {
    const body = req.body;
    const AuthServiceInstance = new AuthService();
    const user = await AuthServiceInstance.login(body);
    if (user.success) {
      // res.cookie("session", user.data?.Bearer, {
      //   httpOnly: true,
      //   maxAge: ms(JWT_EXPIRE),
      //   secure: false,
      //   sameSite: "lax",
      //   priority: "high",
      // });
      res.cookie("session", user.data?.Bearer, {
        httpOnly: true,
        maxAge: ms(JWT_EXPIRE),
        secure: true,
        sameSite: "none",
        priority: "high",
      });
    }
    return res.status(user.success ? OK_STATUS : user.error?.code || 500).json({
      success: user.success,
      data: user.data?.user,
      error: user.error,
    });
  }

  async logout(req: Request, res: Response) {
    const cookie = req.cookies?.session;
    const AuthServiceInstance = new AuthService();
    const response = await AuthServiceInstance.logout(cookie);
    if (response.success) {
      res.clearCookie("session", {
        httpOnly: true,
        maxAge: ms(JWT_EXPIRE),
        secure: true,
        sameSite: "none",
        priority: "high",
      });
    }
    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json({
        success: response.success,
        message: response.message,
        error: response.error,
      });
  }

  async getCurrentUser(req: Request, res: Response) {
    const session = decodeJWT(req, res) as JwtPayload & UserWithoutPassword;

    const user = await prisma.user.findFirst({
      where: {
        id: session.id,
      },
      include: { role: true },
      omit: { password: true },
    });

    return res
      .status(user?.id ? OK_STATUS : INTERNAL_SERVER_STATUS)
      .json({ success: !!user?.id, data: user });
  }

  async createAccount(req: Request, res: Response) {
    const data = req.body;
    const AuthServiceInstance = new AuthService();
    const createdUser = await AuthServiceInstance.createUser(data);

    return res
      .status(
        createdUser.success ? CREATED_STATUS : createdUser.error?.code || 500
      )
      .json(createdUser);
  }

  async updateUser(req: Request, res: Response) {
    const data = req.body;
    const id = parseInt(req.params.id, 10);
    const AuthServiceInstance = new AuthService();
    const updatedUser = await AuthServiceInstance.updateUser(id, data);

    return res
      .status(updatedUser.success ? OK_STATUS : updatedUser.error?.code || 500)
      .json(updatedUser);
  }

  async deleteAccount(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const AuthServiceInstance = new AuthService();
    const deletedAccount = await AuthServiceInstance.deleteUser(id);

    return res
      .status(
        deletedAccount.success ? OK_STATUS : deletedAccount.error?.code || 500
      )
      .json(deletedAccount);
  }
  async getUsers(req: Request, res: Response) {
    const AuthServiceInstance = new AuthService();
    const users = await AuthServiceInstance.getUsers();
    return res
      .status(users.success ? OK_STATUS : users.error?.code || 500)
      .json(users);
  }
  async getUserBasedOnId(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const AuthServiceInstance = new AuthService();
    const user = await AuthServiceInstance.getUserBasedOnId(id);
    return res
      .status(user.success ? OK_STATUS : user.error?.code || 500)
      .json(user);
  }
}

export default AuthController;
