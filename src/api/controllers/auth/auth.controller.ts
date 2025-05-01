import { Request, Response } from "express";
import AuthService from "../../../domain/auth/auth.services";
import { AuthControllerInterface } from "../../../domain/auth/auth.types";
import {
  CREATED_STATUS,
  JWT_EXPIRE,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import ms from "ms";

class AuthController implements AuthControllerInterface {
  async login(req: Request, res: Response) {
    const body = req.body;
    const AuthServiceInstance = new AuthService();
    const user = await AuthServiceInstance.login(body);
    if (user.success) {
      res.cookie("session", user.data?.Bearer, {
        httpOnly: true,
        maxAge: ms(JWT_EXPIRE),
        secure: true,
        sameSite: "lax",
        priority: "high",
      });
    }
    return res.status(user.success ? OK_STATUS : user.error?.code || 500).json({
      success: user.success,
      data: user.data?.user,
      error: user.error,
    });
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
