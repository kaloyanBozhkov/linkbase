import { z } from "zod";
import { prisma } from "@/helpers/prisma";

// Zod schema for export parameters
export const getAllConnectionsUnpaginatedSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type GetAllConnectionsUnpaginatedInput = z.infer<typeof getAllConnectionsUnpaginatedSchema>;

/**
 * Retrieves all connections for a user (unpaginated) with full data for export.
 *
 * @param params - Export parameters (userId)
 * @returns Promise<Connection[]> - All connections with facts and social media
 */
export const getAllConnectionsUnpaginatedQuery = async (
  params: GetAllConnectionsUnpaginatedInput
) => {
  const { userId } = getAllConnectionsUnpaginatedSchema.parse(params);

  return prisma.connection.findMany({
    where: {
      user_id: userId,
    },
    include: {
      social_medias: {
        select: {
          id: true,
          type: true,
          handle: true,
          url: true,
          created_at: true,
          updated_at: true,
        },
      },
      facts: {
        select: {
          id: true,
          text: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};
