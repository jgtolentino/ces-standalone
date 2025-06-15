/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: true,
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
    SYSTEM_ID: 'tbwa-creative-analysis',
    SYSTEM_NAME: 'TBWA Creative Campaign Analysis System',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-System-ID',
            value: 'tbwa-creative-analysis',
          },
          {
            key: 'X-System-Name',
            value: 'TBWA Creative Campaign Analysis System',
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