import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

/**
 * A single long pulse vibration — used for milestone moments like PR celebrations
 * and rest-timer completion. Android plays a sustained 700ms vibration; iOS
 * fires a heavy impact (the closest the CoreHaptics API allows without a custom
 * CHHapticPattern, which is not exposed by expo-haptics).
 */
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
