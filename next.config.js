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
      
      // Suppress webpack warnings for react-dom-polyfill
      config.ignoreWarnings.push(
        {
          module: /lib\/react-dom-polyfill\.js/,
          message: /Critical dependency: the request of a dependency is an expression/,
        }
      );
      
      // Patch react-dom at build time using a webpack plugin
      // This avoids circular dependency issues
      const webpack = require('webpack');
      const path = require('path');
      
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^react-dom$/,
          function(resource) {
            // Only replace for client-side builds and when imported by react-quill
            if (!isServer && resource.context && resource.context.includes('react-quill')) {
              resource.request = path.resolve(__dirname, 'lib/react-dom-polyfill.js');
            }
          }
        )
      );
    }
    
    return config;
  },
  serverExternalPackages: ['sequelize', 'mysql2'],
};

module.exports = nextConfig;