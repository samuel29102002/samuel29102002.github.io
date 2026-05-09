import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // GitHub Pages serves the user-page repo at the root, so no basePath is needed.
  // For project-page repos, set: basePath: '/repo-name', assetPrefix: '/repo-name/'.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
