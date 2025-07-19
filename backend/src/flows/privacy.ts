import { Request, Response } from "express";
import { renderPage } from "./common";

/**
 * Renders the privacy policy page with the provided app name
 */
export async function renderPrivacyPage(req: Request, res: Response): Promise<void> {
  await renderPage(req, res, "privacy", "privacy policy");
} 