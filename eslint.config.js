// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'example/*', '.expo/*'],
  },
  {
    rules: {
      // Debug logging must not ship in the submitted app.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]);
