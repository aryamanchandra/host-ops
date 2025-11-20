/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // geoip-lite ships binary .dat data files that must not be bundled by
    // webpack; resolve them from node_modules at runtime instead.
    serverComponentsExternalPackages: ['geoip-lite'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig

