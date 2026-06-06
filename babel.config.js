module.exports = function (api) {
  api.cache(true);

  const rootAliases = {
    "@": ".",
    app: "./app",
    assets: "./assets",
    components: "./components",
    constants: "./constants",
    contexts: "./contexts",
    hooks: "./hooks",
    mocks: "./mocks",
    services: "./services",
    store: "./store",
    styles: "./styles",
    types: "./types",
    utils: "./utils",
  };

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: rootAliases
        }
      ]
    ]
  };
};
