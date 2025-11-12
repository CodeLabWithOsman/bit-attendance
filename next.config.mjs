/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/bit-attendance',
  assetPrefix: '/bit-attendance',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig

