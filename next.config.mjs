/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // In development, proxy API requests to local FastAPI server
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/v1/:path*",
          destination: "http://127.0.0.1:8000/api/v1/:path*",
        },
        {
          source: "/health",
          destination: "http://127.0.0.1:8000/health",
        },
      ]
    }
    // In production, rewrites are handled by vercel.json
    return []
  },
}

export default nextConfig
