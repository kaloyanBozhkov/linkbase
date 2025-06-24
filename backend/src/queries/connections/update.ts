import { z } from "zod";
import { connectionService } from "../../services/connectionService";

// Zod schema for updating connections
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

export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;

/**
 * Updates an existing connection record in the database.
 *
 * @param id - The connection ID to update
 * @param data - The update data to be validated and applied
 * @returns Promise<Connection> - The updated connection object
 * @throws {ZodError} - If validation fails
 * @throws {Error} - If database operation fails (including P2025 for not found)
 */
export const updateConnectionQuery = async (id: string, data: unknown) => {
  const validatedData = updateConnectionSchema.parse(data);
  return await connectionService.updateConnection(id, validatedData);
};
