import bundleAnalyzer from '@next/bundle-analyzer';
import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = createMDX();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/core/i18n/request.ts',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    qualities: [60, 70, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    unoptimized: false,
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [
      {
        source: '/imgs/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  compress: true,
  poweredByHeader: false,
  turbopack: {
    resolveAlias: {},
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    ...(process.env.VERCEL ? {} : { mdxRs: true }),
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@tabler/icons-react',
      'framer-motion',
      'lucide-react',
      'react-icons',
      'react-icons/fa',
      'react-icons/ri',
      'react-icons/md',
    ],
    // Only enable optimizeCss in production
    ...(process.env.NODE_ENV === 'production' ? { optimizeCss: true } : {}),
    optimizeServerReact: true,
  },
  reactCompiler: true,
  productionBrowserSourceMaps: false,
  // Performance optimizations
  swcMinify: true,
  // Optimize CSS
  cssLoader: false,
};

export default withBundleAnalyzer(withNextIntl(withMDX(nextConfig)));
