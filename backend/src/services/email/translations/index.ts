import { en } from "./en";
import { bg } from "./bg";

// Available translations
const translations = {
  EN_US: en,
  BG_BG: bg,
  // Add other locales here as they become available
  // DE_DE: de,
  // ES_ES: es,
  // etc.
};

export type Locale = keyof typeof translations;

/**
 * Gets translations for a specific locale, falling back to EN_US if not available
 */
export const getTranslations = (locale: string) => {
  const normalizedLocale = locale.toUpperCase() as Locale;
  return translations[normalizedLocale] || translations.EN_US;
};

/**
 * Replaces placeholders in a translation string
 */
export const interpolate = (text: string, params: Record<string, string>): string => {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] || match;
  });
};

/**
 * Gets a nested translation value using dot notation
 */
export const getTranslation = (translations: any, path: string): string => {
  return path.split('.').reduce((obj, key) => obj?.[key], translations) || path;
};
