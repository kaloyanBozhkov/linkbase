import { z } from "zod";
import { prisma } from "@/helpers/prisma";

const PAGE_SIZE = 20;

// Zod schema for search connections parameters
export const searchConnectionsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  userId: z.string().min(1, "User ID is required"),
  cursor: z.number().default(0),
  pageSize: z.number().min(1).max(100).optional().default(PAGE_SIZE),
});

export type SearchConnectionsInput = z.infer<typeof searchConnectionsSchema>;

/**
 * Searches connections by name, facts, or meeting location in the database.
 *
 * @param params - Search parameters (query, user_id?, limit, offset)
 * @returns Promise<Connection[]> - Array of matching connections
 */
export const searchConnectionsQuery = async (
  params: SearchConnectionsInput
) => {
  const { query, userId, cursor, pageSize } =
    searchConnectionsSchema.parse(params);

  return prisma.connection.findMany({
    where: {
      ...(userId && { user_id: userId }),
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          facts: {
            some: {
              text: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
        {
          met_at: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          social_medias: {
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
      social_medias: true,
    },
    skip: cursor,
    take: pageSize,
    orderBy: {
      created_at: "desc",
    },
  });
};
