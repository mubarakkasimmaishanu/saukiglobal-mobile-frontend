// src/utils/globalAlert.ts

export interface AlertConfig {
  title: string;
  message?: string;
  buttons?: Array<{
    text?: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

type AlertListener = (config: AlertConfig) => void;

let listener: AlertListener | null = null;

export const globalAlertManager = {
  register(newListener: AlertListener) {
    listener = newListener;
  },
  unregister() {
    listener = null;
  },
  show(config: AlertConfig) {
    if (listener) {
      listener(config);
    } else {
      // Direct fallback to browser alert
      const msg = config.message ? `${config.title}\n\n${config.message}` : config.title;
      window.alert(msg);
      if (config.buttons && config.buttons[0] && config.buttons[0].onPress) {
        config.buttons[0].onPress();
      }
    }
  }
};
