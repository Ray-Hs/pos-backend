import { Request, Response } from "express";
import PermissionsServices from "../../../domain/permissions/perm.services";
import { UserRolesControllerInterface } from "../../../domain/permissions/perm.types";
import {
  OK_STATUS,
  CREATED_STATUS,
  FORBIDDEN_STATUS,
  FORBIDDEN_ERR,
} from "../../../infrastructure/utils/constants";
import { decodeJWT } from "../../../infrastructure/utils/decodeJWT";

export class PermissionsController implements UserRolesControllerInterface {
  async getUserRoles(req: Request, res: Response) {
    const permissionsServices = new PermissionsServices();
    const response = await permissionsServices.getUserRoles();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
  async getCurrentUserRole(req: Request, res: Response) {
    const userRole = decodeJWT(req, res);
    const roleId = userRole?.roleId;
    const permissionsServices = new PermissionsServices();
    const response = await permissionsServices.getUserRoleById(roleId);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
  async getPermissions(req: Request, res: Response) {
    const permissionsServices = new PermissionsServices();
    const response = await permissionsServices.getPermissions();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getUserRoleById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const permissionsServices = new PermissionsServices();
    const response = await permissionsServices.getUserRoleById(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async createUserRole(req: Request, res: Response) {
    const data = req.body;
    const permissionsServices = new PermissionsServices();
    const response = await permissionsServices.createUserRole(data);

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }

  async updateUserRole(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const data = req.body;
    const permissionsServices = new PermissionsServices();
    const response = await permissionsServices.updateUserRole(id, data);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async deleteUserRole(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const permissionsServices = new PermissionsServices();
    const response = await permissionsServices.deleteUserRole(id);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
