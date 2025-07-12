type LoggableError = TRPCError | FVError | Error | AxiosError;

import { TRPCError } from "@trpc/server";

export const isTrpcError = (err: unknown): err is TRPCError => {
  if (!err || typeof err !== "object") {
    return false;
  }
  return "name" in err && err.name === "TRPCError";
};

export const logError = (error: LoggableError, shouldLogToSentry = true) => {
  if (isFVError(error)) {
    // `FVError` thrown by express endpoint, programmatically (unlikely a 500).
    flog.error(error);
  } else if (isTrpcError(error)) {
    // `TRPCError` thrown by trpc endpoint
    // that could have a `FVError | AxiosError | Error` as `cause`.

    if (error.code === "INTERNAL_SERVER_ERROR") {
      console.error(error);
    } else {
      // Using `.debug` to avoid flooding the logs with HTTP errors.
      flog.debug(error);
    }
  } else {
    // Error (or anything else, e.g. Prisma error) thrown by express endpoint.
    flog.error(error);
  }

  // Always call sentry after all console logs are done.
  if (shouldLogToSentry) {
    Sentry.captureException(error);
  }

  // This must be always at the end.
  formatClientError(error as Error);
};
