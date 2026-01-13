import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Deploying to https://pizzadao.github.io/mixtape/
  basePath: '/mixtape',
};

export default nextConfig;
