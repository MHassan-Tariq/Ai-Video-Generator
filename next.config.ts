import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.223"], // 👈 add this
};

export default nextConfig;