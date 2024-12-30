// next.config.mjs
export default {
  reactStrictMode: false, // Disable React Strict Mode in development

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};
