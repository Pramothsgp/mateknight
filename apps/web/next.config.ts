import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@chess/shared"],
};

export default nextConfig;
