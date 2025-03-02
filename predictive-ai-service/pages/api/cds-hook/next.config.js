// next.config.js
module.exports = {
    webpack(config, { isServer }) {
      // Exclude test files from dependencies
      config.module.rules.push({
        test: /node_modules[\\/]call-bind-apply-helpers[\\/]test|node_modules[\\/]call-bound[\\/]test|node_modules[\\/]dunder-proto[\\/]test/,
        use: 'ignore-loader',
      });
      return config;
    },
  };
  