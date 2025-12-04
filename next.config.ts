import type { NextConfig } from "next";

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

    return config;
  },
};

export default nextConfig;
