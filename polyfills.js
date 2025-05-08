// This file sets up polyfills for Node.js modules in React Native
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';
import { polyfill as polyfillCrypto } from 'react-native-polyfill-globals/src/crypto';
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';

// Apply polyfills
polyfillEncoding();
polyfillReadableStream();
polyfillCrypto();
polyfillFetch();

// Add global.process if it doesn't exist
if (typeof global.process === 'undefined') {
  global.process = require('process/browser');
}

// Polyfill for stream
if (!global.stream) {
  global.stream = require('stream-browserify');
}

// Polyfill for Node.js modules
global.Buffer = global.Buffer || require('buffer').Buffer;
