import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    localPatterns: [{ pathname: "/demo-documents/**", search: "?v=aarohi" }],
  },
};

export default nextConfig;
