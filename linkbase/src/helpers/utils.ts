import { TRPCClientErrorLike } from "@trpc/client";

export const camelCaseWords = (text: string): string => {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Detects if an error is a network-related error
 * @param error - The error object to check
 * @returns true if the error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  // Check for common network error patterns
  if (!error) return false;

  // Check if it's a fetch error (network-level error)
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return true;
  }

  // Check for common network error messages
  const networkErrorMessages = [
    "network",
    "connection",
    "timeout",
    "fetch",
    "unreachable",
    "offline",
    "no internet",
    "failed to fetch",
    "net::err_",
    "connection refused",
    "connection timeout",
  ];

  const errorMessage = error.message?.toLowerCase() || "";
  console.log("errorMessage", errorMessage);
  return networkErrorMessages.some((msg) => errorMessage.includes(msg));
};

/**
 * Gets an appropriate error message based on the error type
 * @param error - The error object
 * @returns A user-friendly error message
 */
export const getErrorMessage = (error: TRPCClientErrorLike<any>): string => {
  if (isNetworkError(error)) {
    return "Network error. Please check your internet connection and try again.";
  }

  // For TRPC errors, use the error message
  if (error?.message) {
    return error.message;
  }

  // Fallback message
  return "An unexpected error occurred. Please try again.";
};

/**
 * Checks if an error should trigger a retry (network errors typically should)
 * @param error - The error object
 * @returns true if the error should trigger a retry
 */
export const shouldRetryError = (error: any): boolean => {
  return isNetworkError(error);
};
