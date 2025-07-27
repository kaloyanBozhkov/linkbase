import { z } from "zod";
import { prisma } from "@/helpers/prisma";

// Zod schema for delete connection parameter
export const deleteConnectionSchema = z.object({
  id: z.string().min(1, "Connection ID is required"),
  userId: z.string().min(1, "User ID is required"),
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
  userId?: string;
}): Promise<void> => {
  const { id, userId } = deleteConnectionSchema.parse(params);
  await prisma.connection.delete({
    where: {
      id,
      user_id: userId,
    },
  });
};
