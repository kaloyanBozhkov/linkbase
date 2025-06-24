import { z } from "zod";
import { prisma } from "../../helpers/prisma";

// Zod schema for pagination parameters
export const getAllConnectionsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type GetAllConnectionsInput = z.infer<typeof getAllConnectionsSchema>;

/**
 * Retrieves all connections with pagination from the database.
 *
 * @param params - Pagination parameters (userId?, limit, offset)
 * @returns Promise<{connections: Connection[], total: number, pagination: object}> - Connections and pagination info
 */
export const getAllConnectionsQuery = async (params: {
  userId?: string;
  limit?: number;
  offset?: number;
}) => {
  const { userId, limit, offset } = getAllConnectionsSchema.parse(params);

  const whereClause = userId ? { userId } : {};

  const connections = await prisma.connection.findMany({
    where: whereClause,
    skip: offset,
    take: limit,
    include: {
      socialMedias: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.connection.count({
    where: whereClause,
  });

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
