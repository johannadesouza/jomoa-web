import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Note: The Performance API error in dev mode is a known Turbopack issue
  // It doesn't affect functionality and can be safely ignored
  // See: https://github.com/vercel/next.js/issues/86060
};

export default nextConfig;
