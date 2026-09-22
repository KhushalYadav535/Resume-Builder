import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      {
        source: "/resume-builder",
        destination: "/resume/builder",
        permanent: true,
      },
      {
        source: "/resume-builder/:path*",
        destination: "/resume/builder/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
