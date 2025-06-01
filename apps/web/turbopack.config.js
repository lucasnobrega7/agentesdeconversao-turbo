/**
 * Turbopack Configuration for Enterprise Performance
 * This file provides advanced Turbopack optimizations
 */

module.exports = {
  // Performance optimizations
  experimental: {
    // Enable React Server Components optimization
    serverComponents: true,
    
    // Enable concurrent features
    concurrent: true,
    
    // Optimize for production even in dev
    optimizeCss: true,
    
    // Advanced caching strategies
    persistentCaching: {
      enabled: true,
      path: '.turbopack/cache'
    }
  },
  
  // Module resolution optimizations
  resolve: {
    // Prefer local modules over node_modules
    preferRelative: true,
    
    // Cache module resolutions
    cache: true,
    
    // Optimize for monorepo structure
    symlinks: false
  },
  
  // Compilation optimizations
  compile: {
    // Use SWC for faster compilation
    swc: true,
    
    // Enable parallel compilation
    parallel: true,
    
    // Optimize for modern browsers
    target: 'es2020',
    
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  // Asset optimization
  assets: {
    // Optimize images on the fly
    images: {
      formats: ['webp', 'avif'],
      quality: 85,
      lazy: true
    },
    
    // Optimize fonts
    fonts: {
      preload: true,
      display: 'swap'
    }
  },
  
  // Development experience
  dev: {
    // Fast refresh configuration
    fastRefresh: {
      enabled: true,
      overlay: true
    },
    
    // Error overlay configuration
    errorOverlay: {
      enabled: true,
      styles: true
    }
  }
}