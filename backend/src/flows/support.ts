import { Request, Response } from "express";
import { renderPage } from "./common";

/**
 * Renders the support page with the provided app name
 */
export async function renderSupportPage(req: Request, res: Response): Promise<void> {
  await renderPage(req, res, "support", "support");
} 