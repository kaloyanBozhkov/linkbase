import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { APP_STORE_URLS } from "@/constants";

/**
 * Content Security Policy headers for HTML pages with Tailwind CDN
 */
const CSP_HEADERS = 
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; " +
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; " +
  "font-src 'self' data:; " +
  "img-src 'self' data: https:;";

/**
 * Converts kebab-case app name to title case
 * e.g., "some-app-name" -> "Some App Name"
 */
export function formatAppName(appName: string): string {
  return appName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Gets the App Store URL for a given app name
 * Falls back to default developer URL if app-specific URL not found
 */
export function getAppStoreUrl(appName: string): string {
  const kebabCaseAppName = appName.toLowerCase().replace(/\s+/g, '-');
  // Check if the app has a specific URL configured
  if (kebabCaseAppName in APP_STORE_URLS) {
    return APP_STORE_URLS[kebabCaseAppName].url;
  }
  return APP_STORE_URLS.default.url;
}

/**
 * Validates that the app name parameter is present in the request
 */
export function validateAppName(req: Request, res: Response): string | null {
  const { appName } = req.params;
  
  if (!appName) {
    res.status(400).json({
      success: false,
      error: "App name parameter is required"
    });
    return null;
  }
  
  return appName;
}

/**
 * Reads and processes an HTML template, replacing app name and App Store URL placeholders
 */
export function processTemplate(templateName: string, appName: string): string {
  const templatePath = path.join(__dirname, `../pages/${templateName}.html`);
  const htmlTemplate = fs.readFileSync(templatePath, 'utf8');
  const formattedAppName = formatAppName(appName);
  const appStoreUrl = getAppStoreUrl(appName);
  const kebabCaseAppName = appName.toLowerCase().replace(/\s+/g, '-');
  
  return htmlTemplate
    .replace(/\{\{APP_NAME\}\}/g, formattedAppName)
    .replace(/\{\{APP_STORE_URL\}\}/g, appStoreUrl)
    .replace(/\{\{APP_NAME_KEBAB\}\}/g, kebabCaseAppName);
}

/**
 * Sets appropriate headers for HTML responses with CSP
 */
export function setHtmlHeaders(res: Response): void {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Security-Policy', CSP_HEADERS);
}

/**
 * Sends an error response for server errors
 */
export function sendServerError(res: Response, error: any, context: string): void {
  console.error(`Error rendering ${context} page:`, error);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
}

/**
 * Generic page renderer that handles the complete flow
 */
export async function renderPage(
  req: Request, 
  res: Response, 
  templateName: string,
  pageType: string
): Promise<void> {
  try {
    const appName = validateAppName(req, res);
    if (!appName) return; // Response already sent by validateAppName
    
    const renderedHtml = processTemplate(templateName, appName);
    setHtmlHeaders(res);
    res.send(renderedHtml);
    
  } catch (error) {
    sendServerError(res, error, pageType);
  }
} 