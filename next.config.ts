import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite conexões de desenvolvimento a partir do IP local na rede Wi-Fi e localhost
  allowedDevOrigins: [
    '192.168.127.26',
    '192.168.127.26:3000',
    '192.168.127.*',
    '192.168.*.*',
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
  ],
};

export default nextConfig;
