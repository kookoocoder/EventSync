// EventSync/next.config.ts (Updated)

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    // Use remotePatterns (recommended over domains)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '', // Optional: Defaults to '' (standard ports 80/443)
        pathname: '/**', // Optional: Allows any path on this hostname
      },
      // Enable Supabase Storage URLs
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Add image optimization settings
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  /* other config options might be here */
  
  // Configure server actions to accept larger file uploads (10MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
};

export default nextConfig;