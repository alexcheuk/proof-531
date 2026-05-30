import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

// Android: 700ms sustained vibration. iOS: heavy impact (CoreHaptics doesn't expose custom patterns via expo-haptics).
export function longPulseVibrate(): void {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 700]);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch {
    // haptics are best-effort
  }
}
