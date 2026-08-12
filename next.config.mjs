/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  async redirects() {
    return [
      {
        source: "/artikel/sprachniveaus-a1-c1",
        destination: "/artikel/sprachniveaus-a0-c2",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
