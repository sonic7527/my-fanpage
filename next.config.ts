import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source:
          "/posts/2026-07-30-%E7%B6%AD%E4%BF%AE%E8%BB%8A%E6%AC%BEYAMAHA-New-Cuxi-115",
        destination:
          "/posts/2026-07-30-yamaha-new-cuxi-115-1053593253836883",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scontent.*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;
