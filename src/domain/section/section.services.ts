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
import { Section, SectionSchema } from "../../types/common";
import {
  createSectionDB,
  deleteSectionDB,
  findSectionByIdDB,
  getSectionsDB,
  updateSectionDB,
} from "./section.repository";
import { SectionServiceInterface } from "./section.types";

export class SectionServices implements SectionServiceInterface {
  async getSections() {
    try {
      const data = await getSectionsDB();
      if (!data || data.length === 0) {
        logger.warn("No Data Found");
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
      logger.error("Get Section Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async getSectionById(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        SectionSchema.pick({ id: true })
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
      const data = await findSectionByIdDB(response.id);

      if (!data) {
        logger.warn("Not Found");
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
      logger.error("Get Section Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async createSection(requestData: any) {
    try {
      const data = await validateType(requestData, SectionSchema);

      if (data instanceof ZodError) {
        logger.warn("Missing Info");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      const createdSection = await createSectionDB(data);
      return {
        success: true,
        data: createdSection,
      };
    } catch (error) {
      logger.error("Get Section Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async updateSection(requestId: any, requestData: any) {
    try {
      const response = await validateType(
        { id: requestId },
        SectionSchema.pick({ id: true })
      );
      const data = await validateType(requestData, SectionSchema);

      if (response instanceof ZodError || !response.id) {
        logger.warn("No ID Provided");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

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

      const existingSection = await findSectionByIdDB(response.id);
      if (!existingSection) {
        logger.warn("No Section Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const updatedSection = await updateSectionDB(response.id, data);
      return {
        success: true,
        data: updatedSection,
      };
    } catch (error) {
      logger.error("Get Section Service: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }
  async deleteSection(requestId: any) {
    try {
      const response = await validateType(
        { id: requestId },
        SectionSchema.pick({ id: true })
      );

      if (response instanceof ZodError || !response.id) {
        logger.warn("No ID Provided");
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_ID_ERR,
          },
        };
      }

      const existingSection = await findSectionByIdDB(response.id);
      if (!existingSection) {
        logger.warn("No Section Found");
        return {
          success: false,
          error: {
            code: NOT_FOUND_STATUS,
            message: NOT_FOUND_ERR,
          },
        };
      }

      const deletedSection = await deleteSectionDB(response.id);
      return {
        success: true,
        data: deletedSection,
      };
    } catch (error) {
      logger.error("Get Section Service: ", error);
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
