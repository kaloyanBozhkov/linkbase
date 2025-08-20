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
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Missing or invalid verification token')}`);
    }

    // Extract verification ID from token
    let verificationId: string;
    try {
      verificationId = EmailService.extractVerificationId(token);
    } catch (error) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Invalid verification token')}`);
    }

    // Get the SSO verification record to get the secret salt
    const verification = await getSsoVerificationByIdQuery(verificationId);
    
    if (!verification) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Verification record not found')}`);
    }

    if (verification.isVerified) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Email already verified')}`);
    }

    // Decrypt the token with the correct secret salt
    let payload;
    try {
      payload = EmailService.decryptVerificationToken(token, verification.secretSalt);
    } catch (error) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Invalid verification token')}`);
    }

    // Check if token is expired (24 hours)
    const now = Date.now();
    const tokenAge = now - payload.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Verification token has expired')}`);
    }

    // Validate that the payload matches the verification record
    if (payload.userId !== verification.userId || payload.email !== verification.email) {
      return res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Token payload mismatch')}`);
    }

    // Complete the verification
    const result = await completeSsoVerificationQuery(
      verification.id,
      verification.userId,
      verification.email
    );

    // Redirect to the verification page with success status
    res.redirect(`/api/email-verification.html?status=success&email=${encodeURIComponent(result.email)}`);
  } catch (error) {
    console.error("Email verification error:", error);
    res.redirect(`/api/email-verification.html?status=error&message=${encodeURIComponent('Invalid verification token')}`);
  }
});

// Serve email verification HTML page
router.get("/email-verification.html", (req, res) => {
  try {
    const filePath = path.join(__dirname, "../pages/email-verification.html");
    const htmlContent = fs.readFileSync(filePath, "utf8");
    res.setHeader("Content-Type", "text/html");
    res.send(htmlContent);
  } catch (error) {
    console.error("Error serving email verification page:", error);
    res.status(500).send("Error loading verification page");
  }
});

// Apply error handling middleware
router.use(handleZodError);
router.use(handlePrismaError);
router.use(handleGeneralError);

export default router;
