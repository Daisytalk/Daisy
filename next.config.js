const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker/Azure deployment
  output: 'standalone',
  
  // Include Prisma files in standalone build
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/.prisma/**/*', './node_modules/@prisma/client/**/*'],
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // i18n configuration (for metadata and SEO)
  // Note: With App Router, we handle routing via [locale] folder structure
  // This config is mainly for metadata and alternate links

  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    API_KEY: process.env.API_KEY,
    // Google OAuth – support both naming conventions
    GOOGLE_CLIENT_ID:
      process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:
      process.env.GOOGLE_CLIENT_SECRET || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI:
      process.env.GOOGLE_REDIRECT_URI || process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION,
    VERTEX_AI_ENDPOINT: process.env.VERTEX_AI_ENDPOINT,
    // Azure ML API (Primary AI endpoint)
    NEXT_PUBLIC_AI_API_URL: process.env.NEXT_PUBLIC_AI_API_URL,
    NEXT_PUBLIC_AI_API_KEY: process.env.NEXT_PUBLIC_AI_API_KEY,
    // SageMaker → Azure ML (you’ll replace these later)
    CBT_API_URL: process.env.CBT_API_URL,
    CBT_API_KEY: process.env.CBT_API_KEY,
  },

  // Compression for production
  compress: true,
  
  // Powered by header
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,

  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  trailingSlash: false,
};

module.exports = withNextIntl(nextConfig);