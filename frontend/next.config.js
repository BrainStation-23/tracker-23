/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@amcharts/amcharts4"],
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
};

module.exports = nextConfig;
