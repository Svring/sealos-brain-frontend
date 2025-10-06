import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // turbopack: {
  //   resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".json"],
  // },
};

export default withPayload(nextConfig);
