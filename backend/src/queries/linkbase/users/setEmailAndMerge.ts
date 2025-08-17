import { prisma } from "@/helpers/prisma";

/**
 * Sets the email for the current user. If another user exists with that email,
 * migrates connections to that SSO user and returns the canonical user id.
 *
 * Returns { userId, mergedFromUserId? }
 */
export const setEmailAndMergeQuery = async (
  currentUserId: string,
  email: string
): Promise<{ userId: string; mergedFromUserId?: string }> => {
  const normalizedEmail = email.toLowerCase();

  return await prisma.$transaction(async (tx) => {
    const existingUserWithEmail = await tx.user.findFirst({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUserWithEmail && existingUserWithEmail.id !== currentUserId) {
      // Move all connections from current user to the SSO user
      await tx.connection.updateMany({
        where: { user_id: currentUserId },
        data: { user_id: existingUserWithEmail.id },
      });

      // Ensure SSO user has email set (it should already)
      await tx.user.update({
        where: { id: existingUserWithEmail.id },
        data: { email: normalizedEmail },
      });

      // Optionally we could delete the old user
      // await tx.user.delete({ where: { id: currentUserId } });

      return { userId: existingUserWithEmail.id, mergedFromUserId: currentUserId };
    }

    // No existing user with that email – set email on current user
    const updated = await tx.user.update({
      where: { id: currentUserId },
      data: { email: normalizedEmail },
      select: { id: true },
    });

    return { userId: updated.id };
  });
};

