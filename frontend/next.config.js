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
