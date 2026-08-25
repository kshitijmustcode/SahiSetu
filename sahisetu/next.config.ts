import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    localPatterns: [{ pathname: "/demo-documents/**", search: "?v=aarohi-v4" }],
  },
};

export default nextConfig;
