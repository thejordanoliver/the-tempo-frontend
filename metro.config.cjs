// metro.config.cjs
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

module.exports = (() => {
  const config = getSentryExpoConfig(__dirname, {
    includeWebReplay: false,
  });

  // Exclude .web.js overrides
  config.resolver.resolverMainFields = ["react-native", "browser", "main"];

  return config;
})();
