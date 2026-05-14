/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/v1/:path*"
            : "/api/index",
      },
      {
        source: "/health",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/health"
            : "/api/index",
      },
    ]
  },
}

export default nextConfig
