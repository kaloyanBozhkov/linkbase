import { z } from "zod";
import { connectionService } from "../../services/connectionService";

// Zod schema for pagination parameters
export const getAllConnectionsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type GetAllConnectionsInput = z.infer<typeof getAllConnectionsSchema>;

/**
 * Retrieves all connections with pagination from the database.
 *
 * @param params - Pagination parameters (limit, offset)
 * @returns Promise<{connections: Connection[], total: number, pagination: object}> - Connections and pagination info
 */
export const getAllConnectionsQuery = async (params: {
  limit?: number;
  offset?: number;
}) => {
  const { limit, offset } = getAllConnectionsSchema.parse(params);

  const connections = await connectionService.getAllConnections(limit, offset);
  const total = await connectionService.getConnectionsCount();

  return {
    connections,
    total,
    pagination: {
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
};
