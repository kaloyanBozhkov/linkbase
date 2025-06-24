import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logError } from "../helpers/logger";
import "../types/express"; // Import the type declarations

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// TODO: refactor asyncHnadler to allow isPublic similr to public/private trpc procedures
const isPublicPath = (path: string) => {
  return path === "/users";
};

// Middleware to extract userId from headers and set up request context
export const setupRequestContext = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.headers["x-user-id"] as string;
  console.log(req.headers);
  if (!userId && !isPublicPath(req.path)) {
    return res.status(401).json({
      success: false,
      error: "User ID is required in headers (X-User-ID)",
    });
  }

  // Set up the request context
  req.ctx = {
    userId,
  };

  next();
};

// Zod validation error middleware
export const handleZodError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation error",
      details: error.errors,
    });
    return;
  }
  next(error);
};

// Prisma error middleware
export const handlePrismaError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle unique constraint violation (user/record already exists)
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0] || "record";
    res.status(409).json({
      success: false,
      error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    });
    return;
  }

  // Handle record not found
  if (error.code === "P2025") {
    res.status(404).json({
      success: false,
      error: "Record not found",
    });
    return;
  }

  next(error);
};

// General error middleware
export const handleGeneralError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logError(`${req.method} ${req.path} error:`, error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

// Async error wrapper to catch async errors and pass them to error middleware
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
