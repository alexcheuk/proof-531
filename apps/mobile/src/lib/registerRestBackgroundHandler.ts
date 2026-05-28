import { Platform } from 'react-native';
import { REST_ADD_ACTION_ID, handleAddRestAction } from './restChronometer';

/**
 * Registers the notify-kit background event handler at module scope (a notify-kit
 * requirement — it must exist before any background event, including when the OS
 * launches a headless JS task for a notification action after the app process
 * was killed). Import this for its side effect once, from the app entry.
 *
 * Handles the rest notification's "+30s" action: extends the deadline carried in
 * the notification data and re-posts the chronometer + reschedules the trigger.
 * On Android only; lazy-required so iOS / jest never load the native module.
 */
if (Platform.OS === 'android') {
  const mod = require('react-native-notify-kit') as typeof import('react-native-notify-kit');
  mod.default.onBackgroundEvent(async ({ type, detail }) => {
    if (type === mod.EventType.ACTION_PRESS && detail.pressAction?.id === REST_ADD_ACTION_ID) {
      await handleAddRestAction(detail.notification?.data);
    }
  });
}
