import { Platform } from 'react-native';
import { REST_ADD_ACTION_ID, handleAddRestAction } from './restChronometer';

// Must register at module scope (before any background event) — notify-kit starts headless tasks before the app
// fully mounts. Import this file once from the app entry for its side effect.
if (Platform.OS === 'android') {
  const mod = require('react-native-notify-kit') as typeof import('react-native-notify-kit');
  mod.default.onBackgroundEvent(async ({ type, detail }) => {
    if (type === mod.EventType.ACTION_PRESS && detail.pressAction?.id === REST_ADD_ACTION_ID) {
      await handleAddRestAction(detail.notification?.data);
    }
  });
}
