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
      // **Important:** If you plan to load images from Supabase Storage,
      // you'll need to add its hostname here as well.
      // Example (replace with your actual Supabase URL hostname):
      // {
      //   protocol: 'https',
      //   hostname: 'tqxurzriebayjklxhnyf.supabase.co', // Replace with YOUR project ref hostname
      //   port: '',
      //   pathname: '/storage/v1/object/**', // Adjust if your storage paths differ
      // },
    ],
  },
  /* other config options might be here */
};

export default nextConfig;