import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n';
import { Inter } from 'next/font/google'
import '../globals.css';
import { ContextualProviders } from '../ContextualProviders'
import { SiteJsonLd } from '@/shared/components/seo/SiteJsonLd'
import { getSiteUrl, DEFAULT_SITE_TITLE, DEFAULT_SITE_DESCRIPTION } from '@/shared/lib/seo'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = getSiteUrl()

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_SITE_TITLE,
    template: `%s | Daisy`,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  applicationName: 'Daisy',
  keywords: [
    'ментальное здоровье',
    'психологическая поддержка',
    'онлайн-психолог',
    'AI психолог',
    'Daisy',
    'эмоциональная поддержка',
    'КПТ',
    'когнитивно-поведенческая терапия',
    'тревога',
    'стресс',
    '24/7',
  ],
  authors: [{ name: 'Daisy', url: SITE_URL }],
  creator: 'Daisy',
  publisher: 'Daisy',
  category: 'health',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  ...(googleVerification
    ? {
        verification: {
          google: googleVerification,
        },
      }
    : {}),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Daisy',
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [
      {
        url: '/images/daisy-icon.svg',
        width: 512,
        height: 512,
        alt: 'Daisy — поддержка ментального здоровья',
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
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [`${SITE_URL}/images/daisy-icon.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.webmanifest',
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
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SiteJsonLd locale={locale} />
        <ContextualProviders>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </ContextualProviders>
      </body>
    </html>
  );
}
