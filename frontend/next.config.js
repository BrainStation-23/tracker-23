/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@amcharts/amcharts4"],
  output: "standalone",
  images: {
    unoptimized: true, // Disable Image Optimization API for next export
  },
};

module.exports = nextConfig;
