import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/document/:path*',
        destination: '/ebooks/:path*',
        permanent: true
      },
      {
        source: '/api/document/:path*',
        destination: '/api/ebooks/:path*',
        permanent: true
      },
      {
        source: '/admin/document/:path*',
        destination: '/admin/ebooks/:path*',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
