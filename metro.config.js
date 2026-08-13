const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Pastikan Metro bisa resolve file platform-specific (.android.tsx, .ios.tsx)
config.resolver.platforms = ['android', 'ios', 'native', 'web'];

module.exports = config;
