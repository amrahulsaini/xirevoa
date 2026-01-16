import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xirevoa.com',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
