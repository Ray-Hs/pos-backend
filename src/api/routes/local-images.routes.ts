import { Router } from "express";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { LocalImageController } from "../controllers/images/local-images.controller";
import logger from "../../infrastructure/utils/logger";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";

const router = Router();
const imageController = new LocalImageController();

// Multer configuration for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)"));
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Custom multer error handler
const handleMulterError = (
  error: any,
  req: express.Request,
  res: express.Response,
  next: any
) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: `Unexpected field. Expected field name: 'image', 'file', or 'photo'. Received: ${error.field}`,
          },
        });
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: "File too large. Maximum size is 10MB.",
          },
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: "Too many files. Only one file allowed.",
          },
        });
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: `Upload error: ${error.message}`,
          },
        });
    }
  }

  if (error.message && error.message.includes("Only image files are allowed")) {
    return res.status(400).json({
      success: false,
      error: {
        code: 400,
        message: error.message,
      },
    });
  }

  next(error);
};

// Multiple field names support for flexibility
const uploadMiddleware = (
  req: express.Request,
  res: express.Response,
  next: any
) => {
  // Try common field names
  const fieldNames = ["image", "file", "photo", "picture"];

  let uploadHandler = upload.any(); // Accept any field name initially

  uploadHandler(req, res, (error: any) => {
    if (error) {
      return handleMulterError(error, req, res, next);
    }

    // Check if we have files and normalize to req.file
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.file = req.files[0]; // Take the first file
      delete req.files; // Clean up
    }

    next();
  });
};

// Upload endpoint
router.post(
  "/upload",
  uploadMiddleware,
  async (req: express.Request, res: express.Response) => {
    try {
      await imageController.uploadImage(req, res);
    } catch (error) {
      logger.error("Error in upload route:", error);
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "Internal server error during upload",
        },
      });
    }
  }
);

// Delete endpoint
router.delete(
  "/delete",
  async (req: express.Request, res: express.Response) => {
    try {
      await imageController.deleteImage(req, res);
    } catch (error) {
      logger.error("Error in delete route:", error);
      res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: "Internal server error during deletion",
        },
      });
    }
  }
);

// Health check endpoint
router.get("/health", (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: "Local image service is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
