/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    API_KEY: process.env.API_KEY,
    // Google OAuth - support both naming conventions
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION,
    VERTEX_AI_ENDPOINT: process.env.VERTEX_AI_ENDPOINT,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  // Disable static optimization completely
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  trailingSlash: false,
  async redirects() {
    return [

    ]
  },
}

module.exports = nextConfig