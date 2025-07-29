import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import indexRouter from "./router";
import { env } from "./env";
import {
  renderSupportPage,
  renderMarketingPage,
  renderPrivacyPage,
  renderTermsPage,
} from "./flows";
import { getConnectionMemory } from "./ai/linkbase/memory";

const app: Application = express();
const PORT = env.PORT;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", indexRouter);

// Page routes - accessible directly without /api prefix
app.get("/support/:appName", renderSupportPage);
app.get("/marketing/:appName", renderMarketingPage);
app.get("/privacy/:appName", renderPrivacyPage);
app.get("/terms/:appName", renderTermsPage);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API is running",
    environment: env.NODE_ENV,
  });
});

app.get("/test-me", async (req, res) => {
  const factMemory = getConnectionMemory({
    userId: "cmdm4xuq60000y84as1j6p22h",
  });

  const results = await factMemory.searchFacts({
    searchTopic: req.body.search,
    similarity: 0.2,
    limit: 10,
  });

  res.status(200).json({
    results,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error:", err.message);
    if (env.NODE_ENV === "development") {
      console.error("Stack trace:", err.stack);
    }
    res.status(500).json({
      error: "Something went wrong!",
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

// Start server (for both development and production Docker deployment)
// Only skip starting the server if explicitly in Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Linkbase API server running on port ${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`CORS origin: ${env.CORS_ORIGIN}`);
  });
  console.log("Server started");
}
// Export for Vercel
export default app;
