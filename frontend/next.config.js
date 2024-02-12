/** @type {import('next').NextConfig} */

module.exports = {
  transpilePackages: ["@amcharts/amcharts4"],
  images: {
    unoptimized: true,
  },
  output: "standalone",
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
