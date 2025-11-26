import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack (default in Next.js 16)
  turbopack: {},
  // Webpack config for pdfjs-dist compatibility (fallback)
  webpack: (config) => {
    // Handle canvas module (not available in browser)
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
