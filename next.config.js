/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/adapter-pg'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
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
