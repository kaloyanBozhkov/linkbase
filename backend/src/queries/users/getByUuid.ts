import { prisma } from "../../helpers/prisma";

/**
 * Retrieves a user by their UUID.
 *
 * @param uuid - The user UUID
 * @returns Promise<User | null> - The user object or null if not found
 * @throws {Error} - If database operation fails
 */
export const getUserByUuidQuery = async (uuid: string) => {
  return await prisma.user.findUnique({
    where: { uuid },
    include: {
      connections: {
        include: {
          socialMedias: true,
        },
      },
    },
  });
};
