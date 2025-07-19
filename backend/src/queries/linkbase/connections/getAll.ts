import { z } from "zod";
import { prisma } from "@/helpers/prisma";

const PAGE_SIZE = 20;

// Zod schema for pagination parameters
export const getAllConnectionsSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  cursor: z.number().min(0).optional().default(0),
  pageSize: z.number().min(1).max(100).optional().default(PAGE_SIZE),
});

export type GetAllConnectionsInput = z.infer<typeof getAllConnectionsSchema>;

/**
 * Retrieves all connections with pagination from the database.
 *
 * @param params - Pagination parameters (userId?, limit, offset)
 * @returns Promise<{connections: Connection[], total: number, pagination: object}> - Connections and pagination info
 */
export const getAllConnectionsQuery = async (
  params: GetAllConnectionsInput
) => {
  const { userId, cursor, pageSize } = getAllConnectionsSchema.parse(params);
  const whereClause = userId ? { userId } : {};
  return prisma.connection.findMany({
    where: whereClause,
    skip: cursor,
    take: pageSize,
    include: {
      socialMedias: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
