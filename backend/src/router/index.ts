import { Router } from "express";
import linkbaseRouter from "./linkbase";
import {
  handleZodError,
  handlePrismaError,
  handleGeneralError,
  setupRequestContext,
} from "./middleware";

const router: Router = Router();

// Apply request context setup middleware to all routes
router.use(setupRequestContext);

router.use("/linkbase", linkbaseRouter);

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
