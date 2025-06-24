import { Router } from "express";
import connectionRoutes from "./connectionRoutes";
import userRoutes from "./userRouiters";
import {
  handleZodError,
  handlePrismaError,
  handleGeneralError,
  setupRequestContext,
} from "./middleware";

const router: Router = Router();

// Apply request context setup middleware to all routes
router.use(setupRequestContext);

// Mount connection routes
router.use("/connections", connectionRoutes);

// Mount user routes
router.use("/users", userRoutes);

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
