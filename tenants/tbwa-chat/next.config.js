/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@ai/ui',
    '@ai/chat-ui', 
    '@ai/db',
    '@ai/agents'
  ],
  // Environment variables
  env: {
    TENANT_ID: 'tbwa-chat',
  },
  // For development
  async redirects() {
    return [
      // Add any redirects if needed
    ];
  },
  // Security headers
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