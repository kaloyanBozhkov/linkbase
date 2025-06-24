import { Router, Request, Response } from "express";
import { z } from "zod";
import { createUserQuery, getUserByUuidQuery } from "../queries/users";
import { asyncHandler } from "./middleware";
import "../types/express"; // Import the type declarations

const router: Router = Router();

// Zod schemas for validation
const userParamsSchema = z.object({
  uuid: z.string().min(1, "User UUID is required"),
});

const createUserSchema = z.object({
  email: z.string().email().optional(),
});

// GET /api/users/:uuid - Get user by UUID
router.get(
  "/:uuid",
  asyncHandler(async (req: Request, res: Response) => {
    const { uuid } = userParamsSchema.parse(req.params);

    const user = await getUserByUuidQuery(uuid);

    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

// POST /api/users - Create new user
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Map frontend data structure to backend expected structure
    const { email } = createUserSchema.parse(req.body);
    const userId = `user-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const userData = {
      uuid: userId,
      email,
    };
    const user = await createUserQuery(userData);

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  })
);

export default router;
