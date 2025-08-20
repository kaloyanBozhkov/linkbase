import { prisma } from "@/helpers/prisma";

/**
 * Marks an SSO verification as complete and updates the user's email.
 * Returns the updated user information.
 */
export const completeSsoVerificationQuery = async (
  verificationId: string,
  userId: string,
  email: string
): Promise<{ userId: string; email: string }> => {
  return await prisma.$transaction(async (tx) => {
    // Mark the verification as complete
    await tx.sso_verification.update({
      where: {
        id: verificationId,
        user_id: userId,
        email: email.toLowerCase(),
      },
      data: {
        is_verified: true,
      },
    });

    // Update the user's email
    const updatedUser = await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        email: email.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
      },
    });

    return {
      userId: updatedUser.id,
      email: updatedUser.email!,
    };
  });
}; 