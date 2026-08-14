const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.platforms = ['android', 'ios', 'native', 'web'];

module.exports = config;
