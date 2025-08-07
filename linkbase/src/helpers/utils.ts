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

/**
 * Converts a local file URI to a File object for upload (React Native/Expo)
 * @param uri - The local file URI from audio recording
 * @param fileName - The name for the file
 * @param fileType - The MIME type of the file
 * @returns Promise<File> - The File object
 * @throws Error if the conversion fails
 */
export const uriToFile = async (
  uri: string,
  fileName: string,
  fileType: string
): Promise<File> => {
  try {
    console.log(`Converting URI to File: ${uri}`);
    
    // For React Native/Expo, we need to read the file as base64 first
    // then convert to blob
    const response = await fetch(uri);
    
    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.status} ${response.statusText}`);
    }
    
    // Get the blob directly from the response
    const blob = await response.blob();
    // Create File object
    const file = new File([blob], fileName, { type: fileType });
    
    console.log(`File created successfully:`);
    console.log(`- Name: ${fileName}`);
    console.log(`- Size: ${file.size} bytes`);
    console.log(`- Type: ${file.type}`);
    console.log(`- Blob size: ${blob.size} bytes`);
    
    if (file.size === 0) {
      throw new Error('File size is 0 bytes - file may be corrupted or empty');
    }
    
    return file;
  } catch (error) {
    console.error("Error converting URI to File:", error);
    console.error("URI:", uri);
    
    if (error instanceof Error) {
      throw new Error(`Failed to convert URI to File: ${error.message}`);
    }
    
    throw new Error("Failed to convert URI to File: Unknown error");
  }
};
