import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

// Android: 3x 2s pulse (2s on, 1s pause) for alarm feel. iOS: heavy impact (CoreHaptics doesn't expose custom patterns via expo-haptics).
export function longPulseVibrate(): void {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 2000, 1000, 2000, 1000, 2000]);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  } catch {
    // haptics are best-effort
  }
}
