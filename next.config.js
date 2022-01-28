/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["github.blog"],
  },
  experimental: {
    outputStandalone: true,
  },
};

module.exports = nextConfig;
