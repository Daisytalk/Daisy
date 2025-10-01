/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
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