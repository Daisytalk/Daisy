/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
  experimental: {
    // Disable static optimization for pages that use client-side context
    forceSwcTransforms: true,
  },
  // Ensure proper handling of client-side routing
  trailingSlash: false,
}

module.exports = nextConfig