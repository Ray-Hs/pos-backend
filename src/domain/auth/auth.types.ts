import { Response, Request } from "express";
import { TResult, User } from "../../types/common";
import { JwtPayload } from "jsonwebtoken";

interface AuthServiceInterface {
  getUserBasedOnId: (requestId: any) => Promise<TResult<User>>;
  getUsers: () => Promise<TResult<User[]>>;
  login: (
    requestData: any
  ) => Promise<TResult<{ Bearer: JwtPayload & User; user: User }>>;
  createUser: (requestData: any) => Promise<TResult<User>>;
  updateUser: (requestId: any, requestData: any) => Promise<TResult<User>>;
  deleteUser: (requestId: any) => Promise<TResult<User>>;
}

interface AuthControllerInterface {
  login: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<{ Bearer: string; user: User }>>>;
  createAccount: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<User>>>;
  deleteAccount: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<User>>>;
  getUsers: (req: Request, res: Response) => Promise<Response<TResult<User[]>>>;
  getUserBasedOnId: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<User>>>;
  updateUser: (req: Request, res: Response) => Promise<Response<TResult<User>>>;
}

export type { AuthServiceInterface, AuthControllerInterface };
