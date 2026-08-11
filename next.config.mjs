/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        module: false,
      };
      
      // สั่งตัดการทำงานของ Prefix node: บนเบราว์เซอร์
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:module': false,
      };
    }

    return config;
  },
};

export default nextConfig;