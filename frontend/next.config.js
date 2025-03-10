/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@amcharts/amcharts4"],
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
