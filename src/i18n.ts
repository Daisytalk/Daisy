// Re-export types and constants for convenience
import { routing } from './i18n/routing';

export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
export type Locale = (typeof locales)[number];

export { default } from './i18n/request';
