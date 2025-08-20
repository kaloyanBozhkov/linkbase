import { prisma } from "@/helpers/prisma";

/**
 * Gets the locale for a user by their ID
 */
export const getLocaleByUserIdQuery = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.locale;
};
