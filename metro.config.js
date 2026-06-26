const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.warn', 'console.error'],
  },
  mangle: true,
  output: { ascii_only: true },
};

module.exports = config;
