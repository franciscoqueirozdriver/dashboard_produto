/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 300,
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  reactStrictMode: true,
};

export default nextConfig;
