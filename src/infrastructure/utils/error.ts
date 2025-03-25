// src/infrastructure/utils/error.ts

// Base application error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set prototype explicitly for better instanceof handling
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden access") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class ServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, false);
  }
}

// Error handler factory
export const asyncErrorHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Function to determine if error is trusted (operational)
export const isTrustedError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Format Prisma errors into AppErrors
export const handlePrismaError = (error: any): AppError => {
  // Handle specific Prisma error codes
  if (error.code === "P2002") {
    return new ConflictError(`Duplicate field value: ${error.meta?.target}`);
  }

  if (error.code === "P2025") {
    return new NotFoundError(`Record not found`);
  }

  // Default to server error
  return new ServerError(`Database error: ${error.message}`);
};
