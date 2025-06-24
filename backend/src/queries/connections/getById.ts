import { z } from "zod";
import { connectionService } from "../../services/connectionService";

// Zod schema for connection ID parameter
export const getConnectionByIdSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
});

export type GetConnectionByIdInput = z.infer<typeof getConnectionByIdSchema>;

/**
 * Retrieves a specific connection by ID from the database.
 *
 * @param params - Object containing the connection ID
 * @returns Promise<Connection | null> - The connection object or null if not found
 */
export const getConnectionByIdQuery = async (params: { id: string }) => {
  const { id } = getConnectionByIdSchema.parse(params);
  return await connectionService.getConnectionById(id);
};
