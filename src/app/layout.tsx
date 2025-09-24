import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

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

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}