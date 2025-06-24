import { z } from "zod";
import { connectionService } from "../../services/connectionService";

// Zod schema for delete connection parameter
export const deleteConnectionSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
});

export type DeleteConnectionInput = z.infer<typeof deleteConnectionSchema>;

/**
 * Deletes a connection record from the database.
 *
 * @param params - Object containing the connection ID
 * @returns Promise<void>
 * @throws {Error} - If database operation fails (including P2025 for not found)
 */
export const deleteConnectionQuery = async (params: {
  id: string;
}): Promise<void> => {
  const { id } = deleteConnectionSchema.parse(params);
  await connectionService.deleteConnection(id);
};
