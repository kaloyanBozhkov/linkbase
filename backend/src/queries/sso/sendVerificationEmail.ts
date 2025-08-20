import { EmailService } from "@/services/email/email";

/**
 * Sends a verification email to the specified email address for the given user.
 * This is the first step in the email verification flow.
 */
export const sendVerificationEmailQuery = async (
  userId: string,
  email: string,
  appName: "linkbase"
): Promise<void> => {
  await EmailService.sendVerificationEmail(email, userId, appName);
}; 