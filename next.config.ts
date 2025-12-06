import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vfuedgrheyncotoxseos.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Vercel optimizations
  compress: true,
  poweredByHeader: false,
  // Ensure proper serverless function timeouts
  experimental: {
    // Optimize serverless functions for Vercel
    serverActions: {
      bodySizeLimit: '8mb', // Match ZIP file limit
    },
  },
};

export default nextConfig;
