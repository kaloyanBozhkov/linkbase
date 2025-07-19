import { Request, Response } from "express";
import { renderPage } from "./common";

/**
 * Renders the terms of service page with the provided app name
 */
export async function renderTermsPage(req: Request, res: Response): Promise<void> {
  await renderPage(req, res, "terms", "terms of service");
} 