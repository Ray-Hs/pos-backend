import { ZodError } from "zod";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
} from "../../infrastructure/utils/constants";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import { UserRoleSchema } from "../../types/common";
import {
  createUserRoleDB,
  deleteUserRoleDB,
  findUserRoleByIdDB,
  getPermissionsDB,
  getUserRolesDB,
  updateUserRoleDB,
} from "./perm.repository";
import { UserRolesServiceInterface } from "./perm.types";

export default class UserRoleService implements UserRolesServiceInterface {
  async getUserRoles() {
    try {
      const data = await getUserRolesDB();
      if (!data || data.length === 0) {
        logger.warn("No UserRoles Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Get UserRoles Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getUserRoleById(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        UserRoleSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await findUserRoleByIdDB(response.id);
      if (!data) {
        logger.warn("UserRole Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Get UserRole By ID Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async createUserRole(requestData: any) {
    try {
      const data = await validateType(requestData, UserRoleSchema);
      if (data instanceof ZodError) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      await createUserRoleDB(data);
      return {
        success: true,
        message: "Created User Role Successfully",
      };
    } catch (error) {
      logger.error("Create UserRole Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateUserRole(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        UserRoleSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await validateType(requestData, UserRoleSchema);
      if (data instanceof ZodError) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }
      const existingRole = await findUserRoleByIdDB(response.id);
      if (!existingRole) {
        logger.warn("UserRole Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      await updateUserRoleDB(response.id, data);
      return {
        success: true,
        message: "Updated UserRole Successfully",
      };
    } catch (error) {
      logger.error("Update UserRole Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteUserRole(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        UserRoleSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const existingRole = await findUserRoleByIdDB(response.id);
      if (!existingRole) {
        logger.warn("UserRole Not Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }
      await deleteUserRoleDB(response.id);
      return {
        success: true,
        message: "Deleted UserRole Successfully",
      };
    } catch (error) {
      logger.error("Delete UserRole Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getPermissions() {
    try {
      const data = await getPermissionsDB();

      if (!data || data.length === 0) {
        logger.warn("No Permissions Found.");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error("Get Permissions Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
}
