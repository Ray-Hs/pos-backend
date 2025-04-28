import { Request, Response } from "express";
import { imageService } from "../../../domain/images/images.services";
import { ImageControllerInterface } from "../../../domain/images/images.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";

export class ImageController implements ImageControllerInterface {
  async uploadImage(req: Request, res: Response) {
    const file = req.file;
    const imageInstance = new imageService();
    const response = await imageInstance.uploadImage(file);

    return res
      .status(response.success ? CREATED_STATUS : response.error?.code || 500)
      .json(response);
  }
  async deleteImage(req: Request, res: Response) {
    const url = req.query?.url as string;
    const imageInstance = new imageService();
    const response = await imageInstance.deleteImage(url);

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
