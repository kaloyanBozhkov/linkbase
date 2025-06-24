import { env } from "../env";

/**
 * Logs error messages with optional stack traces in development mode.
 *
 * This utility function provides consistent error logging across the application.
 * In development mode, it includes detailed stack traces for debugging.
 * In production mode, it logs only the error message to avoid exposing sensitive information.
 *
 * @param message - A descriptive message about where/why the error occurred
 * @param error - The error object or any value to be logged
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   logError('Failed to process user data:', error);
 *   // Handle error appropriately
 * }
 * ```
 */
export const logError = (message: string, error: any): void => {
  console.error(message, error);

  if (env.NODE_ENV === "development") {
    console.error("Stack trace:", error.stack);
  }
};

/**
 * Logs informational messages in development mode only.
 * Useful for debugging without cluttering production logs.
 *
 * @param message - The message to log
 * @param data - Optional data to include with the message
 */
export const logInfo = (message: string, data?: any): void => {
  if (env.NODE_ENV === "development") {
    console.log(message, data || "");
  }
};

/**
 * Logs warning messages.
 * These are logged in all environments as they indicate potential issues.
 *
 * @param message - The warning message
 * @param data - Optional data to include with the warning
 */
export const logWarning = (message: string, data?: any): void => {
  console.warn(message, data || "");
};
