/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize ESLint for faster builds
  eslint: {
    // Only run ESLint on changed files during development
    dirs: ['app', 'components', 'lib', 'src'],
    // Ignore ESLint errors during build (only warnings)
    ignoreDuringBuilds: false,
  },
  // Optimize TypeScript checking
  typescript: {
    // Only run TypeScript checking on changed files
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['sequelize', 'mysql2'],
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
};

module.exports = nextConfig;