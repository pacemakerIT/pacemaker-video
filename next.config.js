/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    domains: ['fast.wistia.net', 'embedwistia-a.akamaihd.net']
  }
};

module.exports = nextConfig;
