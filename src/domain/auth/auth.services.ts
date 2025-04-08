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
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_ERR,
  NOT_FOUND_STATUS,
  UNAUTHORIZED_ERR,
  UNAUTHORIZED_STATUS,
} from "../../infrastructure/utils/constants";
import { hash, verifyHash } from "../../infrastructure/utils/encryptPassword";
import logger from "../../infrastructure/utils/logger";
import validateType from "../../infrastructure/utils/validateType";
import { UserSchema } from "../../types/common";

//? Change
class AuthService implements AuthServiceInterface {
  async login(requestData: any) {
    try {
      const data = await validateType(
        { username: requestData.username, password: requestData.password },
        UserSchema
      );
      if (!data) {
        logger.warn("Missing Info: ", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const userFromDb = await findUserNameDB(data.username);
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
        data.password,
        userFromDb?.password || ""
      );
      if (!isPasswordMatch || dBUsername !== data.username) {
        logger.warn("Credentials Don't Match");
        return {
          success: false,
          error: {
            code: UNAUTHORIZED_STATUS,
            message: UNAUTHORIZED_ERR,
          },
        };
      }

      return {
        success: true,
        data: userFromDb,
      };
    } catch (error) {
      logger.error("Auth login Service: ", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
      };
    }
  }
  async createUser(requestData: any) {
    try {
      const user = await validateType(requestData, UserSchema);

      if (!user) {
        logger.warn("Missing Info: ", user);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const password = hash(user.password);
      const createdUser = await createUserDB(user.username, password);

      return { success: true, data: createdUser };
    } catch (error) {
      logger.error("Auth Create User Service: ", error);
      return {
        success: false,
        error: { code: INTERNAL_SERVER_STATUS, message: INTERNAL_SERVER_ERR },
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
      return { success: true, data: users };
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
      const id = (await validateType({ id: requestId }, UserSchema))?.id;

      if (!id) {
        logger.error("Service ID Not Found: ", id);
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const user = await findUserDB(id);
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

      return {
        success: true,
        data: user,
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
      const id = (await validateType({ id: requestId }, UserSchema))?.id;
      if (!id) {
        logger.warn("ID Not Found");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const data = await validateType(requestData, UserSchema);
      if (!data) {
        logger.warn("Missing info", data);
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const hashedPassword = hash(data.password);
      const updatedUser = await updateUserDB(id, {
        ...data,
        password: hashedPassword,
      });

      return {
        success: true,
        data: updatedUser,
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
      const id = (await validateType({ id: requestId }, UserSchema))?.id;

      if (!id) {
        logger.warn("Missing ID");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const user = await findUserDB(id);
      if (!user) {
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const deletedUser = await deleteUserDB(id);

      return {
        success: true,
        data: deletedUser,
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
