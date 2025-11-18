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
      {
        module: /node_modules\/react-quill/,
        message: /findDOMNode/,
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
      
      // Note: We don't use webpack plugin for react-dom polyfill anymore
      // Instead, we rely on the runtime polyfill (ReactQuillPolyfill component)
      // which patches ReactDOM.findDOMNode at runtime. This avoids build issues.
    }
    
    return config;
  },
  serverExternalPackages: ['sequelize', 'mysql2'],
};

module.exports = nextConfig;