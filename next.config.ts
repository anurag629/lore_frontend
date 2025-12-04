import type { NextConfig } from "next";
// @ts-expect-error - webpack is provided by Next.js at runtime
import webpack from "webpack";

const nextConfig: NextConfig = {
  // Exclude problematic packages from server-side rendering
  serverExternalPackages: ['thread-stream', 'pino'],
  
  // Add empty turbopack config to allow webpack usage
  turbopack: {},
  
  // Configure allowed image domains for next/image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: '*.pinata.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.example.com',
        pathname: '/**',
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    // Exclude test files and other unnecessary files from node_modules
    if (!config.module) {
      config.module = {};
    }
    if (!config.module.rules) {
      config.module.rules = [];
    }
    
    // Ignore test files in thread-stream
    config.module.rules.push({
      test: /node_modules\/thread-stream\/.*\.(test|spec)\.(js|mjs|ts)$/,
      use: 'ignore-loader',
    });

    // Ignore LICENSE and README files
    config.module.rules.push({
      test: /node_modules\/thread-stream\/.*\.(LICENSE|README|md)$/,
      use: 'ignore-loader',
    });

    // Ignore test directories
    config.module.rules.push({
      test: /node_modules\/thread-stream\/test\/.*$/,
      use: 'ignore-loader',
    });

    // Ignore bench files
    config.module.rules.push({
      test: /node_modules\/thread-stream\/bench\.js$/,
      use: 'ignore-loader',
    });

    // Ignore optional wagmi connector dependencies that aren't installed
    // These are peer dependencies that are only needed if you use those specific connectors
    if (!config.plugins) {
      config.plugins = [];
    }
    
    // Use IgnorePlugin to ignore optional dependencies
    const optionalDependencies = [
      '@base-org/account',
      '@coinbase/wallet-sdk',
      '@gemini-wallet/core',
      '@metamask/sdk',
      'porto',
      '@safe-global/safe-apps-sdk',
      '@safe-global/safe-apps-provider'
    ];
    
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource: string) {
          return optionalDependencies.some(dep => resource === dep || resource.startsWith(dep + '/'));
        }
      })
    );
    
    // Also set resolve.alias to false as a fallback
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    optionalDependencies.forEach(dep => {
      config.resolve!.alias![dep] = false;
    });

    return config;
  },
};

export default nextConfig;
