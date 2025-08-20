import { prisma } from "@/helpers/prisma";

/**
 * Retrieves an SSO verification record by its ID.
 */
export const getSsoVerificationByIdQuery = async (
  verificationId: string
): Promise<{ 
  id: string; 
  userId: string; 
  email: string; 
  isVerified: boolean; 
  secretSalt: string;
} | null> => {
  const verification = await prisma.sso_verification.findUnique({
    where: {
      id: verificationId,
    },
    select: {
      id: true,
      user_id: true,
      email: true,
      is_verified: true,
      secret_salt: true,
    },
  });

  if (!verification) {
    return null;
  }

  return {
    id: verification.id,
    userId: verification.user_id,
    email: verification.email,
    isVerified: verification.is_verified,
    secretSalt: verification.secret_salt,
  };
}; 