/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false
};

module.exports = {
  async rewrites() {
    return [
      {
        source: "/sap/:path*",
        destination:
          "https://l5243-iflmap.hcisbp.us2.hana.ondemand.com/:path*",
      },
    ];
  },
};
