import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { formatName } from "../../infrastructure/utils/formatName";
import logger from "../../infrastructure/utils/logger";
import { ImageResponse, ImageServiceInterface } from "./images.types";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
} from "../../infrastructure/utils/constants";
import { TResult } from "../../types/common";

// Create uploads directory path
const UPLOADS_DIR = path.join(process.cwd(), "backend", "uploads", "images");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export class LocalImageService implements ImageServiceInterface {
  constructor() {
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory(): void {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        logger.info(`Created uploads directory: ${UPLOADS_DIR}`);
      }
    } catch (error) {
      logger.error("Error creating uploads directory:", error);
    }
  }

  private createImageDirectory(imageId: string): string {
    const imageDirPath = path.join(UPLOADS_DIR, imageId);
    if (!fs.existsSync(imageDirPath)) {
      fs.mkdirSync(imageDirPath, { recursive: true });
    }
    return imageDirPath;
  }

  private getImageInfoFromUrl(
    url: string
  ): { imageId: string; filename: string } | null {
    try {
      // Extract path from URL: /api/images/imageId/filename
      const urlPath = new URL(url).pathname;
      const pathParts = urlPath.split("/");

      if (
        pathParts.length >= 4 &&
        pathParts[1] === "api" &&
        pathParts[2] === "images"
      ) {
        return {
          imageId: pathParts[3],
          filename: pathParts[4],
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async uploadImage(
    image: Express.Multer.File | undefined
  ): Promise<TResult<ImageResponse>> {
    try {
      if (!image) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: BAD_REQUEST_BODY_ERR,
          },
        };
      }

      // Generate unique image ID and format filename
      const imageId = randomUUID();
      const formattedFilename = `${randomUUID()}-${formatName(
        image.originalname
      )}`;

      console.log(
        `Uploading image: ${image.originalname} -> ${formattedFilename}`
      );

      // Create directory for this image
      const imageDirPath = this.createImageDirectory(imageId);
      const filePath = path.join(imageDirPath, formattedFilename);

      // Write image file
      fs.writeFileSync(filePath, image.buffer);

      // Create metadata file
      const metadata = {
        originalName: image.originalname,
        filename: formattedFilename,
        mimetype: image.mimetype,
        size: image.size,
        uploadDate: new Date().toISOString(),
        imageId: imageId,
      };

      const metadataPath = path.join(imageDirPath, "metadata.json");
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Generate public URL
      const publicUrl = `${BASE_URL}/api/images/${imageId}/${formattedFilename}`;

      logger.info(`Image uploaded successfully: ${publicUrl}`);

      return {
        success: true,
        data: {
          url: publicUrl,
        },
      };
    } catch (error) {
      logger.error("Error uploading image: ", error);
      return {
        success: false,
        error: {
          code: INTERNAL_SERVER_STATUS,
          message: INTERNAL_SERVER_ERR,
        },
      };
    }
  }

  async deleteImage(url: string): Promise<TResult<ImageResponse>> {
    try {
      const imageInfo = this.getImageInfoFromUrl(url);

      if (!imageInfo) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid image URL format",
          },
        };
      }

      const { imageId, filename } = imageInfo;
      const imageDirPath = path.join(UPLOADS_DIR, imageId);

      // Check if directory exists
      if (!fs.existsSync(imageDirPath)) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Image not found",
          },
        };
      }

      // Check if specific file exists
      const filePath = path.join(imageDirPath, filename);
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Image file not found",
          },
        };
      }

      // Delete the entire image directory (including metadata)
      fs.rmSync(imageDirPath, { recursive: true, force: true });

      logger.info(`Image deleted successfully: ${url}`);

      return {
        success: true,
        data: {
          message: "Image deleted successfully",
        },
      };
    } catch (error) {
      logger.error("Error deleting image: ", error);
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
