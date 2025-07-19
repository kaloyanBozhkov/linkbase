import { createTRPCRouter } from "@/trpc/init";
import { linkbaseRouter } from "./linkbase";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Main tRPC router that combines all app routers
export const appRouter = createTRPCRouter({
  linkbase: linkbaseRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
