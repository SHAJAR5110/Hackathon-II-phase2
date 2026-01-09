/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Environment variables (public)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BETTER_AUTH_SECRET: process.env.NEXT_PUBLIC_BETTER_AUTH_SECRET,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },

  // Image configuration (if using Next.js Image component)
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint strict mode
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
