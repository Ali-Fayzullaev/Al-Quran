// next.config.ts
const withNextIntl = require('next-intl/plugin')('./next-intl.config.ts');

module.exports = withNextIntl({
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Экспериментальные функции для производительности
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Оптимизация изображений  
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60 * 60 * 24 * 365, // Кеш на год
  },
  
  // Webpack оптимизация
  webpack: (config: any, { dev, isServer }: any) => {
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Оптимизация бандла
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
});
