const { resolve } = require('node:path');
const { register } = require('tsconfig-paths');

register({
  baseUrl: resolve(__dirname, '..'),
  paths: {
    '@/*': ['dist-test/src/*'],
  },
});
