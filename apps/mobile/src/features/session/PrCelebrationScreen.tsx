import { goTo } from '@/app/routes';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useHardwareBack } from './hooks/useHardwareBack';
import { useSessionCompleteData } from './hooks/useSessionCompleteData';

/**
 * Full-screen, inverted-color celebration shown right after an AMRAP
 * set that registers a new estimated 1RM PR. Inverts the app's paper
 * canvas — ink-on-paper becomes paper-on-ink — so the moment lands.
 *
 * Single CTA "Continue →" replace-routes to the BBB prompt (the normal
 * post-AMRAP path). Android hardware back also pushes forward — the
 * celebration is a one-shot interstitial, never a destination.
 */
export type PrCelebrationScreenProps = {
  sessionId: number;
};

export function PrCelebrationScreen({ sessionId }: PrCelebrationScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const data = useSessionCompleteData(sessionId);

  useEffect(() => {
    // PR moments deserve a heavier haptic than the regular complete-set
    // success — Notification.Success fires a stronger pattern on iOS.
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const onContinue = () => goTo.bbb(router, sessionId, { replace: true });

  // Hardware back also pushes forward (never back into the now-finished
  // live screen).
  useHardwareBack({ enabled: true, onBack: onContinue });

  const v = data.view;

  const surfaceStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.ink0,
  };

  const bodyStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 88,
  };

  const ctaWrap: ViewStyle = {
    paddingHorizontal: 24,
    paddingBottom: 32,
  };

  return (
    <View style={surfaceStyle} testID="pr-celebration">
      <StatusBar style="light" />
      <View style={bodyStyle}>
        <Animated.View entering={FadeIn.duration(320)}>
          <Text
            variant="mono"
            weight="bold"
            size={11}
            color="bg0"
            style={{ letterSpacing: 3, marginBottom: 18 }}
          >
            {'★  YOU HIT A NEW PR  ★'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(120).springify().damping(18)}>
          <Text
            variant="sans"
            weight="bold"
            size={72}
            color="bg0"
            style={{ lineHeight: 78, letterSpacing: -2.6 }}
          >
            Stronger.
          </Text>
        </Animated.View>

        {v ? (
          <Animated.View
            entering={FadeInDown.duration(420).delay(220).springify().damping(18)}
            style={{ marginTop: 36 }}
          >
            <Text
              variant="mono"
              weight="medium"
              size={10}
              color="bg0"
              style={{ letterSpacing: 2, opacity: 0.65 }}
            >
              {`${v.liftLower.toUpperCase()} · ESTIMATED 1RM`}
            </Text>
            <Text
              variant="sans"
              weight="bold"
              size={56}
              color="bg0"
              style={{ lineHeight: 64, letterSpacing: -1.8, marginTop: 4 }}
              numeric
            >
              {`${v.e1RMDisplay} ${v.unitGlyph}`}
            </Text>
            {v.e1RMDelta > 0 ? (
              <Text
                variant="mono"
                weight="semibold"
                size={11}
                color="bg0"
                style={{ letterSpacing: 1.8, marginTop: 8, opacity: 0.7 }}
              >
                {`+${v.e1RMDelta} ${v.unitGlyph} OVER YOUR LAST BEST`}
              </Text>
            ) : null}
          </Animated.View>
        ) : null}
      </View>

      <View style={ctaWrap}>
        <Pressable
          testID="pr-celebration-continue"
          accessibilityRole="button"
          accessibilityLabel="Continue to Boring But Big"
          onPress={onContinue}
          style={({ pressed }) => ({
            backgroundColor: colors.bg0,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text variant="sans" weight="bold" size={15} color="ink0" style={{ letterSpacing: 0.4 }}>
            {'Continue  →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
