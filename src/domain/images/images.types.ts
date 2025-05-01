import { Request, Response } from "express";
import { TResult } from "../../types/common";

export type ImageResponse = {
  url?: string;
  message?: string;
};

export interface ImageServiceInterface {
  uploadImage: (
    image: Express.Multer.File | undefined
  ) => Promise<TResult<ImageResponse>>;
  deleteImage: (url: string) => Promise<TResult<ImageResponse>>;
}

export interface ImageControllerInterface {
  uploadImage: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<ImageResponse>>>;
  deleteImage: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<ImageResponse>>>;
}
