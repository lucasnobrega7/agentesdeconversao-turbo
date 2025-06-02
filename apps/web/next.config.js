import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@repo/ui", "@repo/ui-enterprise", "lucide-react", "recharts", "framer-motion"],
  },
  // Turbopack configuration
  turbopack: {
    // Resolve aliases for cleaner imports
    resolveAlias: {
      '@components': './src/components',
      '@hooks': './src/hooks',
      '@lib': './src/lib',
      '@styles': './src/styles',
      '@utils': './src/utils',
      '@types': './src/types',
      '@contexts': './src/contexts',
      '@services': './src/services',
      '@features': './src/features',
    },
    
    // Extended file resolution
    resolveExtensions: [
      '.mdx',
      '.tsx', 
      '.ts', 
      '.jsx', 
      '.js', 
      '.json',
      '.mjs',
      '.cjs'
    ],
    
    // Module IDs optimization
    moduleIds: 'deterministic',
    
    // Custom rules for specific file types
    rules: {
      // SVG support
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
      // CSS Modules with Lightning CSS
      '*.module.css': {
        loaders: ['css-loader'],
        as: '*.css',
      },
      // SCSS support
      '*.scss': {
        loaders: ['sass-loader'],
        as: '*.css',
      },
      // JSON imports
      '*.json': {
        loaders: ['json-loader'],
        as: '*.js',
      },
    },
  },
  
  // Webpack fallback configuration (for production until Turbopack is stable)
  webpack: (config, { isServer }) => {
    // Only apply if not using Turbopack
    if (!process.env.TURBOPACK) {
      // Optimization for monorepo
      config.resolve.alias = {
        ...config.resolve.alias,
        '@components': './src/components',
        '@hooks': './src/hooks',
        '@lib': './src/lib',
        '@styles': './src/styles',
      }
    }
    return config
  },
}

export default nextConfig