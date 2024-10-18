/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.cache = false;
    }
    
    return config;
  },
};

export default nextConfig;

  