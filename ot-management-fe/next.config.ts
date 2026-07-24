import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Limit build-time workers so page-data collection / static generation doesn't
  // thrash (or hang) on low-memory machines. The app is tiny, so parallelism buys
  // little; 2 workers keeps peak RAM well under control.
  experimental: {
    cpus: 2,
  },
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
