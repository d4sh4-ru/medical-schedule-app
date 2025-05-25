// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  // Объединяем существующие настройки с дефолтными
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer, // Сохраняем дефолтные настройки transformer
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver, // Сохраняем дефолтные настройки resolver
    sourceExts: [...defaultConfig.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'],
  },
};