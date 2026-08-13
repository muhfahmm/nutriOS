import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress specific warnings/errors from expo-notifications in Expo Go
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('expo-notifications: Android Push notifications')
  ) {
    // Hanya suppress error/warning remote push token di Expo Go
    return;
  }
  originalConsoleError(...args);
};

LogBox.ignoreLogs([
  'Android Push notifications',
  'expo-notifications: Android Push notifications',
]);

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
