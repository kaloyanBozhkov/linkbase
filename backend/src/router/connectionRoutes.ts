import { Router, Request, Response } from "express";
import {
  createConnectionQuery,
  getAllConnectionsQuery,
  getConnectionByIdQuery,
  updateConnectionQuery,
  deleteConnectionQuery,
  searchConnectionsQuery,
} from "../queries/connections";
import { logError } from "../helpers/logger";

const router: Router = Router();

// GET /api/connections - Get all connections with pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await getAllConnectionsQuery({ limit, offset });

    res.json({
      success: true,
      data: result.connections,
      pagination: result.pagination,
    });
  } catch (error) {
    logError("Get connections error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch connections",
    });
  }
});

// GET /api/connections/search - Search connections
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { query, limit = 20, offset = 0 } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({
        success: false,
        error: "Search query is required",
      });
      return;
    }

    const connections = await searchConnectionsQuery({
      query,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({
      success: true,
      data: connections,
      query,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    logError("Search connections error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search connections",
    });
  }
});

// GET /api/connections/:id - Get connection by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const connection = await getConnectionByIdQuery({ id: req.params.id });

    if (!connection) {
      res.status(404).json({
        success: false,
        error: "Connection not found",
      });
      return;
    }

    res.json({
      success: true,
      data: connection,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    logError("Get connection error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch connection",
    });
  }
});

// POST /api/connections - Create new connection
router.post("/", async (req: Request, res: Response) => {
  try {
    const connection = await createConnectionQuery(req.body);

    res.status(201).json({
      success: true,
      data: connection,
      message: "Connection created successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    logError("Create connection error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create connection",
    });
  }
});

// PUT /api/connections/:id - Update connection
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const connection = await updateConnectionQuery(req.params.id, req.body);

    res.json({
      success: true,
      data: connection,
      message: "Connection updated successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Connection not found",
      });
      return;
    }

    logError("Update connection error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update connection",
    });
  }
});

// DELETE /api/connections/:id - Delete connection
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteConnectionQuery({ id: req.params.id });

    res.json({
      success: true,
      message: "Connection deleted successfully",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Connection not found",
      });
      return;
    }

    logError("Delete connection error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete connection",
    });
  }
});

export default router;
