export const env = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || '',
    GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',

    // Gemini AI / Vertex AI
    // Support both API_KEY (AWS) and GEMINI_API_KEY
    API_KEY: process.env.API_KEY || process.env.GEMINI_API_KEY || '',
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
    VERTEX_AI_ENDPOINT: process.env.VERTEX_AI_ENDPOINT || '',

    NODE_ENV: process.env.NODE_ENV || 'development',
} as const

// Validate critical environment variables on server-side
if (typeof window === 'undefined') {
    const missingVars: string[] = []
    
    if (!env.DATABASE_URL) missingVars.push('DATABASE_URL')
    if (!env.API_KEY && !env.GEMINI_API_KEY) missingVars.push('API_KEY or GEMINI_API_KEY')
    
    if (missingVars.length > 0) {
        console.warn('⚠️  Missing environment variables:', missingVars.join(', '))
    }
}
