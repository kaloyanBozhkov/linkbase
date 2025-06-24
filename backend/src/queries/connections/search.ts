import { z } from "zod";
import { prisma } from "../../helpers/prisma";

// Zod schema for search connections parameters
export const searchConnectionsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  userId: z.string().min(1, "User ID is required"),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type SearchConnectionsInput = z.infer<typeof searchConnectionsSchema>;

/**
 * Searches connections by name, facts, or meeting location in the database.
 *
 * @param params - Search parameters (query, userId?, limit, offset)
 * @returns Promise<Connection[]> - Array of matching connections
 */
export const searchConnectionsQuery = async (params: {
  query: string;
  userId?: string;
  limit?: number;
  offset?: number;
}) => {
  const { query, userId, limit, offset } =
    searchConnectionsSchema.parse(params);

  return await prisma.connection.findMany({
    where: {
      ...(userId && { userId }),
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          facts: {
            hasSome: [query],
          },
        },
        {
          metAt: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          socialMedias: {
            some: {
              handle: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    },
    include: {
      socialMedias: true,
    },
    skip: offset,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });
};
