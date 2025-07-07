/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'], // Para imágenes del backend
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig