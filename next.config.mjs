/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/bit-attendance',
  assetPrefix: '/bit-attendance/',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
