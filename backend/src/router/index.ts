import { Router } from "express";
import {
  handleZodError,
  handlePrismaError,
  handleGeneralError,
  setupRequestContext,
} from "./middleware";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter, createTRPCContext } from "@/trpc/index";
import s3Router from "./s3";
import { EmailService } from "@/services/email/email";
import { getSsoVerificationByIdQuery, completeSsoVerificationQuery } from "@/queries/linkbase/users";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const router: Router = Router();

// Apply request context setup middleware to all routes
router.use(setupRequestContext);

// tRPC route - accessible at /api/trpc
router.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createTRPCContext,
  })
);

router.use("/s3", s3Router);

router.use("/hello", (req, res) => {
  res.json({
    success: true,
    data: "Hello World",
  });
});

// Email verification endpoint
router.get("/verify-email", async (req, res) => {
  try {
    const { token, locale, appName } = req.query;

    if (!token || typeof token !== "string") {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Missing or invalid verification token')}&locale=${encodeURIComponent(locale as string || 'EN_US')}&appName=${encodeURIComponent(appName as string || 'linkbase')}`);
    }

    // Extract verification ID from token
    let verificationId: string;
    try {
      verificationId = EmailService.extractVerificationId(token);
    } catch (error) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Invalid verification token')}&locale=${encodeURIComponent(locale as string || 'EN_US')}&appName=${encodeURIComponent(appName as string || 'linkbase')}`);
    }

    // Get the SSO verification record to get the secret salt
    const verification = await getSsoVerificationByIdQuery(verificationId);
    
    if (!verification) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Verification record not found')}&locale=${encodeURIComponent(locale as string || 'EN_US')}&appName=${encodeURIComponent(appName as string || 'linkbase')}`);
    }

    if (verification.isVerified) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Email already verified')}&locale=${encodeURIComponent(locale as string || 'EN_US')}&appName=${encodeURIComponent(appName as string || 'linkbase')}`);
    }

    // Decrypt the token with the correct secret salt
    let payload;
    try {
      payload = EmailService.decryptVerificationToken(token, verification.secretSalt);
    } catch (error) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Invalid verification token')}&locale=${encodeURIComponent(locale as string || 'EN_US')}&appName=${encodeURIComponent(appName as string || 'linkbase')}`);
    }

    // Check if token is expired (24 hours)
    const now = Date.now();
    const tokenAge = now - payload.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Verification token has expired')}&locale=${encodeURIComponent(locale as string || 'EN_US')}&appName=${encodeURIComponent(appName as string || 'linkbase')}`);
    }

    // Validate that the payload matches the verification record
    if (payload.userId !== verification.userId || payload.email !== verification.email) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Token payload mismatch')}&locale=${encodeURIComponent(locale as string || 'EN_US')}&appName=${encodeURIComponent(appName as string || 'linkbase')}`);
    }

    // Complete the verification
    const result = await completeSsoVerificationQuery(
      verification.id,
      verification.userId,
      verification.email
    );

    // Redirect to the verification page with success status
    res.redirect(`/api/email-verification.html?status=success&email=${encodeURIComponent(result.email)}&locale=${encodeURIComponent(locale as string || 'EN_US')}&appName=${encodeURIComponent(appName as string || 'linkbase')}`);
  } catch (error) {
    console.error("Email verification error:", error);
    res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Invalid verification token')}&locale=${encodeURIComponent(req.query.locale as string || 'EN_US')}&appName=${encodeURIComponent(req.query.appName as string || 'linkbase')}`);
  }
});

// Serve email verification HTML page
router.get("/email-verification.html", (req, res) => {
  try {
    const filePath = path.join(__dirname, "../pages/email-verification.html");
    let htmlContent = fs.readFileSync(filePath, "utf8");
    
    // Generate a nonce for CSP
    const nonce = crypto.randomBytes(16).toString('base64');
    
    // Add nonce to the script tag
    htmlContent = htmlContent.replace(
      '<script>',
      `<script nonce="${nonce}">`
    );
    
    // Set CSP header with nonce
    res.setHeader("Content-Security-Policy", `script-src 'self' 'nonce-${nonce}'`);
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error serving email verification page:", error);
    res.status(500).send("Error loading verification page");
  }
});

// Serve translations for email verification page
router.get("/email-verification-translations", (req, res) => {
  try {
    const { locale } = req.query;
    const requestedLocale = (locale as string) || 'EN_US';
    
    // Import translations dynamically
    const { getTranslations } = require("../services/email/translations");
    const translations = getTranslations(requestedLocale);
    
    res.json(translations);
  } catch (error) {
    console.error("Error serving translations:", error);
    res.status(500).json({ error: "Failed to load translations" });
  }
});

// Apply error handling middleware
router.use(handleZodError);
router.use(handlePrismaError);
router.use(handleGeneralError);

export default router;
