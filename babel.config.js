module.exports = function (api) {
  api.cache(true);
  // Expo resolves the aliases declared in tsconfig.json.
  return { presets: ["babel-preset-expo"] };
};
