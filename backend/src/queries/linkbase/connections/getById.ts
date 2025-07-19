import { z } from "zod";
import { prisma } from "@/helpers/prisma";

// Zod schema for connection ID parameter
export const getConnectionByIdSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type GetConnectionByIdInput = z.infer<typeof getConnectionByIdSchema>;

/**
 * Retrieves a specific connection by ID from the database.
 *
 * @param params - Object containing the connection ID
 * @returns Promise<Connection | null> - The connection object or null if not found
 */
export const getConnectionByIdQuery = async (params: {
  id: string;
  userId?: string;
}) => {
  const { id, userId } = getConnectionByIdSchema.parse(params);
  return await prisma.connection.findUnique({
    where: {
      id,
      userId,
    },
    include: {
      socialMedias: true,
    },
  });
};
