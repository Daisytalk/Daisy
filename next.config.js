/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
}

module.exports = nextConfig