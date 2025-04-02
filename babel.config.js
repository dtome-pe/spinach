module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required plugins
      '@babel/plugin-transform-export-namespace-from',
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }],
      // Reanimated plugin has to be listed last
      'react-native-reanimated/plugin',
    ],
  };
}; 