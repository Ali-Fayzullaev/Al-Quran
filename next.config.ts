// next.config.ts
const withNextIntl = require('next-intl/plugin')('./next-intl.config.ts');

module.exports = withNextIntl({
  reactStrictMode: true
});
