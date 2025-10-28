// next.config.ts
const withNextIntl = require('next-intl/plugin')('./next-intl.config.ts');

module.exports = withNextIntl({
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Оптимизация изображений  
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
  },
  
  // Webpack оптимизация
  webpack: (config: any, { dev, isServer }: any) => {
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
});
