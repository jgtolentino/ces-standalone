/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASE_PATH || '',
  env: {
    TENANT_SLUG: process.env.TENANT_SLUG || 'template',
  },
  experimental: {
    serverComponentsExternalPackages: ['@ai/db'],
  },
  // Enable static exports for better deployment flexibility
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig