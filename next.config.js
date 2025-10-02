/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
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
      {
        source: '/register',
        destination: '/waitlist',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig