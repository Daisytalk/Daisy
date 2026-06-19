export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || '',
  AZURE_COMMUNICATION_CONNECTION_STRING: process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '',
  AZURE_COMMUNICATION_EMAIL_SENDER: process.env.AZURE_COMMUNICATION_EMAIL_SENDER || '',
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
  /** Server-only — never use NEXT_PUBLIC_ for ML endpoint credentials */
  AI_API_URL: process.env.AI_API_URL || '',
  AI_API_KEY: process.env.AI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FREEDOMPAY_MERCHANT_ID: process.env.FREEDOMPAY_MERCHANT_ID || '',
  FREEDOMPAY_API_KEY: process.env.FREEDOMPAY_API_KEY || '',
  /** 32+ chars for AES-256-GCM encryption at rest */
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
} as const

if (typeof window === 'undefined') {
  const missingVars: string[] = []

  if (!env.DATABASE_URL) missingVars.push('DATABASE_URL')
  if (!env.AI_API_URL) missingVars.push('AI_API_URL')
  if (!env.AI_API_KEY) missingVars.push('AI_API_KEY')

  if (env.NODE_ENV === 'production') {
    if (!env.ENCRYPTION_KEY || env.ENCRYPTION_KEY.trim().length < 32) {
      missingVars.push('ENCRYPTION_KEY (min 32 chars required in production)')
    }
  }

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '))
  }
}
