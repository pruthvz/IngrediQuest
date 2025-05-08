const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js modules
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('crypto-browserify'),
  http: require.resolve('@tradle/react-native-http'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify/browser'),
  fs: require.resolve('react-native-fs'),
  path: require.resolve('path-browserify'),
  zlib: require.resolve('zlib-browserify'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser'),
  events: require.resolve('events'),
  net: require.resolve('react-native-tcp'),
  tls: require.resolve('react-native-tcp'),
  url: require.resolve('url'),
  assert: require.resolve('assert')
};

module.exports = config;
