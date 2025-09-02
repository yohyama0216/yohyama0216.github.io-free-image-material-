/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: '/yohyama0216.github.io-free-image-material-',
  assetPrefix: '/yohyama0216.github.io-free-image-material-/',
  // Ensure proper file generation for GitHub Pages
  distDir: 'out',
}

module.exports = nextConfig
