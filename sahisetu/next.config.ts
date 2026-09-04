import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    localPatterns: [{ pathname: "/demo-documents/**" }],
  },
};

export default nextConfig;
