/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/adapter-pg'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    // PDF.js's unminified bundle redeclares __webpack_require__, which collides
    // with Next's eval-based development runtime. The minified entry avoids it.
    config.resolve.alias['pdfjs-dist$'] = require.resolve(
      'pdfjs-dist/build/pdf.min.mjs',
      { paths: [require.resolve('react-pdf')] }
    );
    // Keep the worker version aligned with React-PDF's PDF.js dependency.
    config.resolve.alias['pdfjs-dist/build/pdf.worker.min.mjs'] =
      require.resolve('pdfjs-dist/build/pdf.worker.min.mjs', {
        paths: [require.resolve('react-pdf')]
      });
    return config;
  },
  images: {
    // domains: ['fast.wistia.net', 'embedwistia-a.akamaihd.net']

    remotePatterns: [
      { protocol: 'https', hostname: 'fast.wistia.net' },
      { protocol: 'https', hostname: 'embedwistia-a.akamaihd.net' },
      { protocol: 'https', hostname: '**.supabase.co' }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value:
              "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests"
          }
        ]
      }
    ];
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  }
};

module.exports = nextConfig;
