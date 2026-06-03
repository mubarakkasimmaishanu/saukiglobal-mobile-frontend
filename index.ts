import { registerRootComponent } from 'expo';
import { Alert, Platform } from 'react-native';

import { globalAlertManager } from './src/utils/globalAlert';

import App from './App';

// Global Alert patch for Web platform compatibility
if (Platform.OS === 'web') {
  Object.defineProperty(Alert, 'alert', {
    value: (title: string, message?: string, buttons?: any[]) => {
      globalAlertManager.show({ title, message, buttons });
    },
    writable: true,
    configurable: true
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
