/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app.digitvitation.my.id',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
