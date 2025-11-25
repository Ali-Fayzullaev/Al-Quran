// next.config.ts
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Экспериментальные функции для производительности
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@tanstack/react-query'],
    webpackBuildWorker: true, // Параллельная сборка
    optimizeCss: true, // Оптимизация CSS
  },
  
  // Turbopack конфигурация (вместо experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Оптимизация изображений  
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60 * 60 * 24 * 365, // Кеш на год
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Headers для кеширования
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  
  // Webpack оптимизация
  webpack: (config: any, { dev, isServer }: any) => {
    // Производственная оптимизация
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Агрессивное разделение бандла
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    // Уменьшаем размер бандла
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    
    return config;
  },
};
