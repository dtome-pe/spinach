module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required plugins
      '@babel/plugin-transform-export-namespace-from',
      // Reanimated plugin has to be listed last
      'react-native-reanimated/plugin',
    ],
  };
}; 