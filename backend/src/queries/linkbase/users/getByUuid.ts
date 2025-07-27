import { prisma } from "@/helpers/prisma";

/**
 * Retrieves a user by their UUID.
 *
 * @param uuid - The user UUID
 * @returns Promise<User | null> - The user object or null if not found
 * @throws {Error} - If database operation fails
 */
export const getUserByUuidQuery = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      connections: {
        include: {
          social_medias: true,
          facts: true,
        },
      },
    },
  });
};
