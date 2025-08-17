import { prisma } from "@/helpers/prisma";

/**
 * Retrieves a user by their email.
 */
export const getUserByEmailQuery = async (email: string) => {
  if (!email) return null;
  return prisma.user.findFirst({
    where: { email: email.toLowerCase() },
    include: {
      connections: true,
    },
  });
};

