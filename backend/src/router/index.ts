import { Router } from "express";
import {
  handleZodError,
  handlePrismaError,
  handleGeneralError,
  setupRequestContext,
} from "./middleware";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter, createTRPCContext } from "../trpc/index";

const router: Router = Router();

// Apply request context setup middleware to all routes
router.use(setupRequestContext);

// tRPC route - accessible at /api/trpc
router.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  })
);

router.use("/hello", (req, res) => {
  res.json({
    success: true,
    data: "Hello World",
  });
});

// Apply error handling middleware
router.use(handleZodError);
router.use(handlePrismaError);
router.use(handleGeneralError);

export default router;
