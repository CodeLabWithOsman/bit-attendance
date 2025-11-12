/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/bit-attendance',
  trailingSlash: true,
  distDir: '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
