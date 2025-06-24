import { z } from "zod";

export const createConnectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  igHandle: z.string().optional(),
  metAt: z
    .string()
    .min(1, "Meeting place is required")
    .max(200, "Meeting place must be less than 200 characters"),
  facts: z.array(z.string()).min(1, "At least one fact is required"),
});

export const updateConnectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  igHandle: z.string().optional(),
  metAt: z
    .string()
    .min(1, "Meeting place is required")
    .max(200, "Meeting place must be less than 200 characters")
    .optional(),
  facts: z.array(z.string()).min(1, "At least one fact is required").optional(),
});

export const searchConnectionsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;
export type SearchConnectionsInput = z.infer<typeof searchConnectionsSchema>;
