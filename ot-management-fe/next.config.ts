import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow the dev server to accept requests to internal resources (HMR, RSC, server
  // actions) when opened via the LAN IP instead of localhost.
  allowedDevOrigins: ['192.168.2.158'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '192.168.2.158' },
    ],
  },
};

export default nextConfig;
