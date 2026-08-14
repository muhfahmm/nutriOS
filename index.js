import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';


const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    args[0].includes('expo-notifications: Android Push notifications')
  ) {
    return;
  }
  originalConsoleError(...args);
};

LogBox.ignoreLogs([
  'Android Push notifications',
  'expo-notifications: Android Push notifications',
]);

import App from './App';
registerRootComponent(App);
