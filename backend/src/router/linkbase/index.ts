import { Router } from "express";
import connectionRoutes from "./connectionRoutes";
import userRoutes from "./userRouiters";

const router: Router = Router();

// Mount connection routes
router.use("/connections", connectionRoutes);

// Mount user routes
router.use("/users", userRoutes);

export default router;
