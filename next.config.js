/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    // Handle Material-UI with Next.js
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Suppress Sequelize warnings
    config.ignoreWarnings = [
      {
        module: /node_modules\/sequelize/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/sequelize/,
        message: /Module not found: Error: Can't resolve/,
      },
    ];
    
    // Suppress specific warnings
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  serverExternalPackages: ['sequelize', 'mysql2'],
};

module.exports = nextConfig;