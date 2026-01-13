import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If deploying to https://pizzadao.github.io/mixtape/, uncomment and set basePath
  // basePath: '/mixtape',
};

export default nextConfig;
