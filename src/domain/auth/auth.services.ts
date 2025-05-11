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
        userFromDb.role
      )) as JwtPayload & User & string;
      const user: UserWithoutPassword = {
        id: userFromDb.id,
        role: userFromDb.role,
        username: userFromDb.username,
        image: userFromDb.image,
        createdAt: userFromDb.createdAt,
        updatedAt: userFromDb.updatedAt,
      };
      return {
        success: true,
        data: {
          Bearer,
          user,
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

      const password = hash(response.password);
      const createdUser = await createUserDB(response.username, password);

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

      const data: UserWithoutPassword[] = users.map((user) => ({
        id: user.id,
        role: user.role,
        username: user.username,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

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

      const userById: UserWithoutPassword = {
        id: user.id,
        role: user.role,
        username: user.username,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        data: userById,
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

      const hashedPassword = hash(data.password);
      const updatedUser = await updateUserDB(response.id, {
        ...data,
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
