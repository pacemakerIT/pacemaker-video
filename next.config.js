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
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  }
};

module.exports = nextConfig;
