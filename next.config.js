/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Temporarily commented out for local testing
  // basePath: '/yohyama0216.github.io-free-image-material-',
  // assetPrefix: '/yohyama0216.github.io-free-image-material-/',
}

module.exports = nextConfig
