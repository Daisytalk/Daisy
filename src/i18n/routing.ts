import { defineRouting } from 'next-intl/routing';

// en — локаль по умолчанию; ru — русский интерфейс (/ru/...)
export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'always',
})

// Re-export for convenience
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
export type Locale = (typeof locales)[number];
