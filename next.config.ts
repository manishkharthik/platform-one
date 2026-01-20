import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-expect-error NextConfig types may not include this yet
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;