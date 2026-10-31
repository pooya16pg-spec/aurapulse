const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isProd ? "/aurapulse" : "",
  assetPrefix: isProd ? "/aurapulse" : "",
};

module.exports = nextConfig;