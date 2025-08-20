import { getApiBaseUrl } from "@linkbase/shared/api.config";
import { Resend } from "resend";
import crypto from "crypto";
import { env } from "@/env";
import { EmailStyles } from "../stylings";
import { createSsoVerificationQuery } from "@/queries/linkbase/users";
import { capitalize } from "deverything";

const resend = new Resend(env.RESEND_API_KEY);

const ALGORITHM = "aes-256-cbc";

interface VerificationPayload {
  verificationId: string;
  userId: string;
  email: string;
  timestamp: number;
}

export class EmailService {
  private static encrypt(text: string, secretSalt: string): string {
    const iv = crypto.randomBytes(16);
    // Create a key from the secret salt (hash it to ensure proper length)
    const key = crypto.scryptSync(secretSalt, "salt", 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  private static decrypt(encryptedText: string, secretSalt: string): string {
    const textParts = encryptedText.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedData = textParts.join(":");
    // Create a key from the secret salt (hash it to ensure proper length)
    const key = crypto.scryptSync(secretSalt, "salt", 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  static createVerificationToken(
    payload: VerificationPayload,
    secretSalt: string
  ): string {
    const jsonString = JSON.stringify(payload);
    const encrypted = this.encrypt(jsonString, secretSalt);
    // Embed the verification ID in the token for easy lookup
    return `${payload.verificationId}:${encrypted}`;
  }

  static decryptVerificationToken(
    token: string,
    secretSalt: string
  ): VerificationPayload {
    try {
      const parts = token.split(":");
      if (parts.length < 2) {
        throw new Error("Invalid token format");
      }
      const encrypted = parts.slice(1).join(":");
      const decrypted = this.decrypt(encrypted, secretSalt);
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error("Invalid verification token");
    }
  }

  static extractVerificationId(token: string): string {
    const parts = token.split(":");
    if (parts.length < 2) {
      throw new Error("Invalid token format");
    }
    return parts[0];
  }

  static async sendVerificationEmail(
    email: string,
    userId: string,
    appName: "linkbase"
  ): Promise<void> {
    // Create SSO verification record with secret salt
    const { id: verificationId, secretSalt } = await createSsoVerificationQuery(
      userId,
      email
    );

    const payload: VerificationPayload = {
      verificationId,
      userId,
      email,
      timestamp: Date.now(),
    };

    const token = this.createVerificationToken(payload, secretSalt);
    const verificationUrl = `${
      getApiBaseUrl(env.NODE_ENV === "development") || "http://localhost:3000"
    }/verify-email?token=${encodeURIComponent(token)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - ${capitalize(appName)}</title>
${EmailStyles.verifyEmail[appName]}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${capitalize(appName)}</div>
            </div>
            
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Hi there! You're setting up email verification for your ${capitalize(
                appName
              )} account. This will enable:</p>
              
              <ul>
                <li><strong>Cross-device sync:</strong> Access your connections on any device</li>
                <li><strong>Secure backup:</strong> Your data is safely stored in the cloud</li>
                <li><strong>Account recovery:</strong> Easily restore your data if you change phones</li>
              </ul>
              
              <p>Click the button below to verify your email address:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="warning">
                <strong>Security Note:</strong> This link will expire in 24 hours. If you didn't request this verification, you can safely ignore this email.
              </div>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>If you have any questions, contact us at kaloyan@bozhkov.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: `${appName} <noreply@eventrave.com>`, // TODO set proper domain based on app
        to: [email],
        subject: `Verify Your Email - ${appName}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }
}
