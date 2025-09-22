export const env = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || '',
    GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
    
    // Gemini AI / Vertex AI
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    VERTEX_AI_ENDPOINT: process.env.VERTEX_AI_ENDPOINT || '',
    
    NODE_ENV: process.env.NODE_ENV || 'development',
} as const