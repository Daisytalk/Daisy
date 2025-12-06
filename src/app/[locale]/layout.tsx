import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Inter } from 'next/font/google'
import '../globals.css';
import { ContextualProviders } from '../ContextualProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Daisy - Quality Mental Health Conversations | Online Therapy Platform',
  description: 'Connect with licensed therapists through secure, HIPAA-compliant online therapy. 24/7 mental health support, flexible scheduling, and personalized care.',
  keywords: ['mental health', 'online therapy', 'licensed therapists', 'HIPAA compliant', 'teletherapy', 'counseling', 'mental wellness'],
  authors: [{ name: 'Daisy Mental Health' }],
  openGraph: {
    title: 'Daisy - Quality Mental Health Conversations',
    description: 'Connect with licensed therapists through secure, HIPAA-compliant online therapy. 24/7 mental health support and personalized care.',
    type: 'website',
    siteName: 'Daisy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daisy - Quality Mental Health Conversations',
    description: 'Connect with licensed therapists through secure, HIPAA-compliant online therapy.',
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
  if (!routing.locales.includes(locale as any)) {
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
