import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Inter } from 'next/font/google'
import '../globals.css';
import { ContextualProviders } from '../ContextualProviders'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://talktodaisy.com'
const SITE_TITLE = 'Daisy - качественные разговоры о ментальном здоровье'
const SITE_DESCRIPTION = 'Безопасное пространство без осуждения: поддержка и ясные шаги к внутреннему балансу. На основе научных подходов, 24/7.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | Daisy`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['ментальное здоровье', 'психологическая поддержка', 'онлайн-терапия', 'Daisy', 'эмоциональная поддержка', 'КПТ', '24/7'],
  authors: [{ name: 'Daisy' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: 'Daisy',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/images/daisy-icon.png',
        width: 512,
        height: 512,
        alt: 'Daisy',
      },
      {
        url: '/images/logo.svg',
        width: 512,
        height: 512,
        alt: 'Daisy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/images/daisy-icon.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!routing.locales.includes(locale as 'ru')) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ContextualProviders>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </ContextualProviders>
      </body>
    </html>
  );
}
