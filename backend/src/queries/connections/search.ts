import { z } from "zod";
import { connectionService } from "../../services/connectionService";

// Zod schema for search connections parameters
export const searchConnectionsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type SearchConnectionsInput = z.infer<typeof searchConnectionsSchema>;

/**
 * Searches connections by name, facts, or meeting location in the database.
 *
 * @param params - Search parameters (query, limit, offset)
 * @returns Promise<Connection[]> - Array of matching connections
 */
export const searchConnectionsQuery = async (params: {
  query: string;
  limit?: number;
  offset?: number;
}) => {
  const { query, limit, offset } = searchConnectionsSchema.parse(params);
  return await connectionService.searchConnections(query, limit, offset);
};
