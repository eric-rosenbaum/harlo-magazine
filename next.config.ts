import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev server from other devices on the LAN (e.g. a phone at
  // http://192.168.1.154:3000) so HMR/dev resources aren't blocked.
  allowedDevOrigins: ["192.168.1.154"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
