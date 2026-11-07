/**
 * Extends app.json with values that must not be committed to the public repo.
 *
 * GOOGLE_MAPS_ANDROID_API_KEY comes from an EAS environment variable on build servers
 * (or from .env locally). Expo Go shows maps without a key, but compiled Android builds
 * (APK/AAB) show a blank map unless the key is added to the react-native-maps plugin.
 */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }],
  ],
});
