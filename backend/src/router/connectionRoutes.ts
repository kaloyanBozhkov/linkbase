import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  createConnectionQuery,
  getAllConnectionsQuery,
  getConnectionByIdQuery,
  updateConnectionQuery,
  deleteConnectionQuery,
  searchConnectionsQuery,
} from "../queries/connections";
import { asyncHandler } from "./middleware";
import "../types/express"; // Import the type declarations

const router: Router = Router();

// Route-level Zod schemas for request validation (userId removed since it's in ctx)
const queryPaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

const searchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

const connectionParamsSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
});

// GET /api/connections - Get all connections with pagination
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { limit, offset } = queryPaginationSchema.parse(req.query);
    const { userId } = req.ctx;

    if (!userId) {
      res.json({
        success: true,
        data: [],
        pagination: 0,
      });
      return;
    }

    const result = await getAllConnectionsQuery({
      limit,
      offset,
      userId,
    });

    res.json({
      success: true,
      data: result.connections,
      pagination: result.pagination,
    });
  })
);

// GET /api/connections/search - Search connections
router.get(
  "/search",
  asyncHandler(async (req: Request, res: Response) => {
    const queryData = searchQuerySchema.parse(req.query);
    const { userId } = req.ctx;

    const connections = await searchConnectionsQuery({
      ...queryData,
      userId,
    });

    res.json({
      success: true,
      data: connections,
      query: queryData.query,
    });
  })
);

// GET /api/connections/:id - Get connection by ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = connectionParamsSchema.parse(req.params);
    const { userId } = req.ctx;

    const connection = await getConnectionByIdQuery({ id, userId });

    if (!connection) {
      const error = new Error("Connection not found");
      (error as any).statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: connection,
    });
  })
);

// POST /api/connections - Create new connection
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.ctx;

    const connection = await createConnectionQuery({
      ...req.body,
      userId,
    });

    res.status(201).json({
      success: true,
      data: connection,
      message: "Connection created successfully",
    });
  })
);

// PUT /api/connections/:id - Update connection
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = connectionParamsSchema.parse(req.params);
    const { userId } = req.ctx;

    const connection = await updateConnectionQuery(id, {
      ...req.body,
      userId,
    });

    res.json({
      success: true,
      data: connection,
      message: "Connection updated successfully",
    });
  })
);

// DELETE /api/connections/:id - Delete connection
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = connectionParamsSchema.parse(req.params);
    const { userId } = req.ctx;

    await deleteConnectionQuery({
      id,
      userId,
    });

    res.json({
      success: true,
      message: "Connection deleted successfully",
    });
  })
);

export default router;
