import { TRPCError } from "@trpc/server";

type LoggableError = TRPCError | Error;

export const isTrpcError = (err: unknown): err is TRPCError => {
  if (!err || typeof err !== "object") {
    return false;
  }
  return "name" in err && err.name === "TRPCError";
};

/**
 * Formats error for client consumption by sanitizing sensitive information
 * and providing a consistent error structure.
 */
export const formatClientError = (error: LoggableError): { message: string; code?: string } => {
  // For TRPC errors, preserve the code and sanitized message
  if (isTrpcError(error)) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  // For generic errors, provide a sanitized message
  // In production, you might want to return a generic message to avoid leaking sensitive info
  const isDevelopment = process.env.NODE_ENV === "development";
  
  return {
    message: isDevelopment ? error.message : "An unexpected error occurred",
  };
};

export const logError = (error: LoggableError, extra?: unknown) => {
  if (isTrpcError(error)) {
    // TRPCError thrown by trpc endpoint
    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.error("TRPC Internal Server Error:", error.message);
      if (error.cause) {
        console.error("Caused by:", error.cause, extra);
      }
      // Log stack trace for internal server errors
      console.error("Stack:", error.stack, extra);
    } else {
      // Using console.log for non-server errors to avoid flooding error logs
      console.log(`TRPC ${error.code}:`, error.message, extra);
      if (process.env.NODE_ENV === "development" && error.stack) {
        console.log("Stack:", error.stack, extra);
      }
    }
  } else {
    // Generic Error (Prisma errors, etc.)
    console.error("Error:", error.message, extra);
    if (process.env.NODE_ENV === "development" && error.stack) {
      console.error("Stack:", error.stack, extra);
    }
  }

  // Return formatted error for potential client use
  return formatClientError(error);
};
