import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Bundle size optimization
  compress: true,

  // Enable strict mode for better error checking
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/webp'],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
};

export default nextConfig;
