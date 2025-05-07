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

  env: {
    // Add the Gemini API key as a public environment variable
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
