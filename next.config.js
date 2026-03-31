/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [],
  },
}

module.exports = nextConfig
