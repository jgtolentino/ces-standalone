/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  webpack: (config, { isServer }) => {
    // Exclude problematic packages from build
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('ces-drive-scraper', 'azurance');
    }
    return config;
  },
  env: {
    SYSTEM_ID: 'scout-analytics-v3.1.0',
    SYSTEM_NAME: 'Scout Analytics v3.1.0',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-System-ID',
            value: 'scout-analytics-v3.1.0',
          },
          {
            key: 'X-System-Name',
            value: 'Scout Analytics v3.1.0',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;