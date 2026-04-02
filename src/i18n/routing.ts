import { defineRouting } from 'next-intl/routing';

// ru — по умолчанию; en — английский сайт и интерфейс (/en/...)
export const routing = defineRouting({
  locales: ['ru', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'always',
})

// Re-export for convenience
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
export type Locale = (typeof locales)[number];
