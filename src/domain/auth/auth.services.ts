import { JwtPayload } from "jsonwebtoken";
import { ZodError } from "zod";
import {
  createUserDB,
  deleteUserDB,
  findUserDB,
  findUserNameDB,
  getUsersDB,
  updateUserDB,
} from "../../domain/auth/auth.repository";
import { AuthServiceInterface } from "../../domain/auth/auth.types";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ERR,
  BAD_REQUEST_ID_ERR,
  BAD_REQUEST_STATUS,
  CREATED_SUCCESS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NO_CONTENT_STATUS,
  NO_CONTENT_SUCCESS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
  OK_SUCCESS,
  UNAUTHORIZED_ERR,
  UNAUTHORIZED_STATUS,
} from "../../infrastructure/utils/constants";
import { createJWT } from "../../infrastructure/utils/createJWT";
import { hash, verifyHash } from "../../infrastructure/utils/encryptPassword";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import {
  TResult,
  User,
  UserRole,
  UserSchema,
  UserWithoutPassword,
} from "../../types/common";

//? Change
class AuthService implements AuthServiceInterface {
  async login(requestData: any) {
    try {
      const response = await validateType(
        { username: requestData.username, password: requestData.password },
        UserSchema
      );
      if (response instanceof ZodError || !response) {
        logger.warn("Missing Info: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      if (!response.username || !response.password) {
        logger.warn("Username or Password is missing: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const userFromDb = await findUserNameDB(response.username);
      if (!userFromDb) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const dBUsername = userFromDb?.username;
      const isPasswordMatch = verifyHash(
        response.password,
        userFromDb?.password || ""
      );
      if (!isPasswordMatch || dBUsername !== response.username) {
        logger.warn("Credentials Don't Match");
        return {
          success: false,
          error: {
            code: UNAUTHORIZED_STATUS,
            message: UNAUTHORIZED_ERR,
          },
        };
      }

      const Bearer = (await createJWT(
        userFromDb.username,
        userFromDb.id,
        userFromDb.role as UserRole,
        userFromDb.isActive
      )) as JwtPayload & User & string;
      const { password, ...user } = userFromDb;

      return {
        success: true,
        data: {
          Bearer,
          user: {
            ...user,
            role: user.role ?? undefined,
          },
        },
      };
    } catch (error) {
      logger.error("Auth login Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async logout(cookie: string) {
    try {
      if (!cookie) {
        logger.warn("No Cookie Provided");
        return {
          success: false,
          error: {
            code: NO_CONTENT_STATUS,
            message: NO_CONTENT_SUCCESS,
          },
        };
      }

      return {
        success: true,
        message: "Logged out successfully.",
      };
    } catch (error) {
      logger.error("Auth login Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async createUser(requestData: any) {
    try {
      const response = await validateType(requestData, UserSchema);

      if (response instanceof ZodError || !response) {
        logger.warn("Missing Info: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
            details: response,
          },
        };
      }

      if (!response.username || !response.password) {
        logger.warn("Username or Password is missing: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const password = hash(response.password);
      const createdUser = await createUserDB(response);

      return { success: true, message: CREATED_SUCCESS };
    } catch (error) {
      logger.error("Auth Create User Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
          details: error,
        },
      };
    }
  }

  async getUsers() {
    try {
      const users = await getUsersDB();
      if (!users) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ERR,
          },
        };
      }

      const data: UserWithoutPassword[] = users.map(
        ({ password, settingsId, role, ...rest }) => ({
          ...rest,
          role: role ?? undefined, // convert null to undefined for compatibility
        })
      );

      return { success: true, data };
    } catch (error) {
      logger.error("Auth Get Users Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async getUserBasedOnId(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        UserSchema.pick({ id: true })
      );

      if (response instanceof ZodError || !response.id) {
        logger.error("Service ID Not Found: ", response);
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const user = await findUserDB(response.id);
      if (!user) {
        logger.error("Service User Not Found: ", user);
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const { password, ...userById } = user;

      return {
        success: true,
        data: {
          ...userById,
          role: userById.role ?? undefined,
        },
      };
    } catch (error) {
      logger.error("Auth Get User Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateUser(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        UserSchema.pick({ id: true })
      );
      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }
      const data = await validateType(requestData, UserSchema);
      if (data instanceof ZodError || !data) {
        logger.warn("Missing info", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
            details: data,
          },
        };
      }

      const existingUser = await findUserDB(response.id);
      if (!existingUser) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const hashedPassword = data.password
        ? hash(data.password)
        : data.password;
      const updatedUser = await updateUserDB(response.id, {
        ...data,
        isActive: data.isActive ?? existingUser.isActive,
        password: hashedPassword,
      });

      return {
        success: true,
        message: OK_SUCCESS,
      };
    } catch (error) {
      logger.error("Auth Update User Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteUser(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        UserSchema.pick({ id: true })
      );

      if (response instanceof ZodError || !response.id) {
        logger.warn("Missing ID: ", response);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const user = await findUserDB(response.id);
      if (!user) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const deletedUser = await deleteUserDB(response.id);

      return {
        success: true,
        message: OK_SUCCESS,
      };
    } catch (error) {
      logger.error("Auth Delete User Service: ", error);
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

export default AuthService;
