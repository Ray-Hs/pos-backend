import { Response, Request } from "express";
import { TResult, User, UserWithoutPassword } from "../../types/common";
import { JwtPayload } from "jsonwebtoken";

interface AuthServiceInterface {
  getUserBasedOnId: (requestId: any) => Promise<TResult<UserWithoutPassword>>;
  getUsers: () => Promise<TResult<UserWithoutPassword[]>>;
  login: (
    requestData: any
  ) => Promise<
    TResult<{ Bearer: JwtPayload & User; user: UserWithoutPassword }>
  >;
  createUser: (requestData: any) => Promise<TResult<void>>;
  updateUser: (requestId: any, requestData: any) => Promise<TResult<void>>;
  deleteUser: (requestId: any) => Promise<TResult<void>>;
}

interface AuthControllerInterface {
  login: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<UserWithoutPassword>>>;
  getUsers: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<UserWithoutPassword[]>>>;
  getUserBasedOnId: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<UserWithoutPassword>>>;
  createAccount: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  deleteAccount: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  updateUser: (req: Request, res: Response) => Promise<Response<TResult<void>>>;
}

export type { AuthServiceInterface, AuthControllerInterface };
