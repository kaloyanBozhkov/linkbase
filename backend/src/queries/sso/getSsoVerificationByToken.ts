import { prisma } from "@/helpers/prisma";

interface TokenPayload {
  verificationId: string;
  userId: string;
  email: string;
  timestamp: number;
}

/**
 * Retrieves an SSO verification record by its ID and validates the payload.
 */
export const getSsoVerificationByTokenQuery = async (
  payload: TokenPayload
): Promise<{ 
  id: string; 
  userId: string; 
  email: string; 
  isVerified: boolean; 
  secretSalt: string;
} | null> => {
  const verification = await prisma.sso_verification.findFirst({
    where: {
      id: payload.verificationId,
      user_id: payload.userId,
      email: payload.email.toLowerCase(),
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