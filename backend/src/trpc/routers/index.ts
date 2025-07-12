import { createTRPCRouter } from "../init";
import { linkbaseRouter } from "./linkbase";

// Main tRPC router that combines all app routers
export const appRouter = createTRPCRouter({
  linkbase: linkbaseRouter,
});

export type AppRouter = typeof appRouter;
