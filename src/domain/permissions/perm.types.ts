import { Request, Response } from "express";
import { UserRole, TResult, Permission } from "../../types/common";

export interface UserRolesServiceInterface {
  getUserRoles: () => Promise<TResult<UserRole[]>>;
  getUserRoleById: (requestId: number) => Promise<TResult<UserRole>>;
  createUserRole: (requestData: UserRole) => Promise<TResult<void>>;
  updateUserRole: (
    requestId: number,
    requestData: UserRole
  ) => Promise<TResult<void>>;
  deleteUserRole: (requestId: number) => Promise<TResult<void>>;
  getPermissions: () => Promise<TResult<Permission[]>>;
}

export interface UserRolesControllerInterface {
  getUserRoles: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<UserRole[]>>>;
  getCurrentUserRole: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<UserRole>>>;
  getUserRoleById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<UserRole>>>;
  createUserRole: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  updateUserRole: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  deleteUserRole: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<void>>>;
  getPermissions: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Permission[]>>>;
}
