import { Request, Response } from "express";
import {
  ImageControllerInterface,
  ImageResponse,
} from "../../../domain/images/images.types";
import { LocalImageService } from "../../../domain/images/localimages.services";
import {
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
} from "../../../infrastructure/utils/constants";
import logger from "../../../infrastructure/utils/logger";
import { TResult } from "../../../types/common";

export class LocalImageController implements ImageControllerInterface {
  private imageService: LocalImageService;

  constructor() {
    this.imageService = new LocalImageService();
  }

  async uploadImage(
    req: Request,
    res: Response
  ): Promise<Response<TResult<ImageResponse>>> {
    try {
      const image = req.file;

      if (!image) {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "No image file provided",
          },
        });
      }

      const result = await this.imageService.uploadImage(image);

      if (result.success) {
        logger.info(`Image uploaded successfully: ${result.data?.url}`);
        return res.status(200).json(result);
      } else {
        logger.error(`Image upload failed: ${result.error?.message}`);
        return res
          .status(result.error?.code || BAD_REQUEST_STATUS)
          .json(result);
      }
    } catch (error) {
      logger.error("Error in uploadImage controller:", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }

  async deleteImage(
    req: Request,
    res: Response
  ): Promise<Response<TResult<ImageResponse>>> {
    try {
      const { url } = req.body;

      if (!url || typeof url !== "string") {
        return res.status(BAD_REQUEST_STATUS).json({
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Image URL is required",
          },
        });
      }

      const result = await this.imageService.deleteImage(url);

      if (result.success) {
        logger.info(`Image deleted successfully: ${url}`);
        return res.status(200).json(result);
      } else {
        logger.error(`Image deletion failed: ${result.error?.message}`);
        return res
          .status(result.error?.code || BAD_REQUEST_STATUS)
          .json(result);
      }
      logger.info(`Image deleted successfully: ${url}`);
      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error in deleteImage controller:", error);
      return res.status(INTERNAL_SERVER_STATUS).json({
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      });
    }
  }
}
