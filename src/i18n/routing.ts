import { defineRouting } from 'next-intl/routing';

// Пока только русская версия
export const routing = defineRouting({
  locales: ['ru'],
  defaultLocale: 'ru',
  localePrefix: 'always'
});

// Re-export for convenience
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
export type Locale = (typeof locales)[number];
