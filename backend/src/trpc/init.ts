import { initTRPC, TRPCError } from "@trpc/server";
import { Request, Response } from "express";
import { z } from "zod";
import superjson from "superjson";

// Define context interface explicitly
export interface TRPCContext {
  userId?: string;
  appName: "linkbase";
}

// Create context for tRPC
export function createTRPCContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): TRPCContext {
  // Get user ID from header (set by your existing middleware)
  const userId = req.headers["x-user-id"] as string;
  const appName = req.headers["x-app-name"] as "linkbase";
  const context: TRPCContext = {
    userId,
    appName,
  };
  return context;
}

export type Context = TRPCContext;

// Initialize tRPC with explicit context type
const t = initTRPC
  .context<TRPCContext>()
  .meta<{
    // Add any metadata you need here
    // This helps avoid naming collisions
    procedures: Record<string, unknown>;
  }>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof z.ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

// Export helpers with explicit types
export const createTRPCRouter = t.router;
export const baseProcedure = t.procedure;

// Create a procedure that requires authentication
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // userId is now guaranteed to exist
    },
  });
});

export const publicProcedure = baseProcedure;
