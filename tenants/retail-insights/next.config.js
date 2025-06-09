/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@ai/ui',
    '@ai/dashboard-ui',
    '@ai/db',
    '@ai/tailwind-config'
  ],
  env: {
    TENANT_ID: 'retail-insights',
    TENANT_NAME: 'Philippines Retail Insights Dashboard',
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  webpack: (config) => {
    // Handle canvas for D3 server-side rendering
    config.externals = [...config.externals, 'canvas'];
    return config;
  },
  experimental: {
    // Enable experimental features for better performance
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;