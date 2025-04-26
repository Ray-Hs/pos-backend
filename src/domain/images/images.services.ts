import {
  DeleteObjectCommand,
  ListObjectVersionsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { formatName } from "../../infrastructure/utils/formatName";
import logger from "../../infrastructure/utils/logger";
import { ImageResponse, ImageServiceInterface } from "./images.types";
import b2 from "./s3.instance";
import {
  BAD_REQUEST_BODY_ERR,
  BAD_REQUEST_ERR,
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERR,
  INTERNAL_SERVER_STATUS,
} from "../../infrastructure/utils/constants";
import { TResult } from "../../types/common";

const bucketName = process.env.BUCKET_NAME || "restaurant-pos";

export class imageService implements ImageServiceInterface {
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

      console.log(image.originalname);
      const imagePath = `${randomUUID()}-${formatName(image?.originalname)}`;
      const fileBuffer = Buffer.from(image.buffer);

      const response = await b2.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: imagePath,
          Body: fileBuffer,
        })
      );

      const publicUrl = `https://s3.eu-central-003.backblazeb2.com/${bucketName}/${imagePath}`;
      const status = response.$metadata.httpStatusCode;

      if (status === 200 || status === 201) {
        return {
          success: true,
          data: {
            url: publicUrl,
          },
        };
      }

      return {
        success: false,
        error: {
          code: BAD_REQUEST_STATUS,
          message: BAD_REQUEST_ERR,
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

  async deleteImage(url: string) {
    try {
      // Extract file path from URL
      const filePath = url.split(`${bucketName}/`)[1];
      if (!filePath) {
        return {
          success: false,
          error: {
            code: BAD_REQUEST_STATUS,
            message: "Invalid image URL",
          },
        };
      }

      // Get all versions of the object
      const versions: string[] = [];
      const listVersionsResponse = await b2.send(
        new ListObjectVersionsCommand({
          Bucket: bucketName,
          Prefix: filePath,
        })
      );

      if (listVersionsResponse.Versions) {
        listVersionsResponse.Versions.forEach((version) => {
          if (version.VersionId) {
            versions.push(version.VersionId);
          }
        });
      }

      // Delete all versions of the object
      for (const versionId of versions) {
        await b2.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            VersionId: versionId,
          })
        );
      }

      return {
        success: true,
        data: {
          message: "Image Deleted Successfully",
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
