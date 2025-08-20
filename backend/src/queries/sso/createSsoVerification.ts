import { prisma } from "@/helpers/prisma";
import crypto from "crypto";

/**
 * Creates a new SSO verification record for a user and email.
 * Generates a unique secret salt for encryption key derivation.
 */
export const createSsoVerificationQuery = async (
  userId: string,
  email: string
): Promise<{ id: string; secretSalt: string }> => {
  // Generate a random secret salt for this verification
  const secretSalt = crypto.randomBytes(32).toString('hex');
  
  const verification = await prisma.sso_verification.create({
    data: {
      user_id: userId,
      email: email.toLowerCase(),
      secret_salt: secretSalt,
      is_verified: false,
    },
    select: {
      id: true,
      secret_salt: true,
    },
  });

  return {
    id: verification.id,
    secretSalt: verification.secret_salt,
  };
}; 