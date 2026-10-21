/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/adapter-pg'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    // pdfjs-dist's readable ESM bundle declares its own `var __webpack_exports__`,
    // which collides with the module wrapper Next uses in dev and throws
    // "Object.defineProperty called on non-object" as soon as react-pdf imports
    // it. The minified build carries no such identifier.
    config.resolve.alias['pdfjs-dist$'] =
      require.resolve('pdfjs-dist/build/pdf.min.mjs');
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
