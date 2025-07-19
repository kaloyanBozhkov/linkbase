import { Request, Response } from "express";
import { renderPage } from "./common";

/**
 * Renders the marketing page with the provided app name
 */
export async function renderMarketingPage(req: Request, res: Response): Promise<void> {
  await renderPage(req, res, "marketing", "marketing");
} 