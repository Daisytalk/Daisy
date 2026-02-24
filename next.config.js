const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone only for non-Docker builds
  // For Docker, we'll copy full node_modules
  output: process.env.DOCKER_BUILD ? undefined : 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Only NEXT_PUBLIC_* non-secret vars belong here.
  // Server-side secrets (JWT_SECRET, AI_API_KEY, GOOGLE_CLIENT_SECRET, etc.)
  // are read directly from process.env at runtime — they must NOT be declared
  // here or they risk being embedded in the client-side JS bundle.
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
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
