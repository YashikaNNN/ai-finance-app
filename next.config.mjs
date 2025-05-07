// Load Prisma workaround first
import './prisma-client-workaround.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  
  // Instead of transpilePackages in experimental
  transpilePackages: ["lucide-react"],

  env: {
    // Add the Gemini API key as a public environment variable
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  
  // ESLint configuration
  eslint: {
    // Warning only on production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
