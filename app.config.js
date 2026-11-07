/**
 * Extends app.json with values that must not be committed to the public repo.
 *
 * GOOGLE_MAPS_ANDROID_API_KEY comes from an EAS environment variable on build servers
 * (or from .env locally). Expo Go shows maps without a key, but on a compiled Android
 * build (APK/AAB) Google Maps crashes the app if the key is missing. `extra.googleMapsEnabled`
 * tells the app whether this build has a key, so the Map tab can show a list instead.
 */
const googleMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['react-native-maps', { androidGoogleMapsApiKey: googleMapsKey }],
  ],
  extra: { ...config.extra, googleMapsEnabled: Boolean(googleMapsKey) },
});
