import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { useEffect } from 'react';
import { Text as RNText, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ComparisonRow } from './ComparisonRow';
import { CornerTicks } from './CornerTicks';
import { HeroNumberRow } from './HeroNumberRow';
import { PaperCapsText } from './PaperCapsText';
import { SignOffRow } from './SignOffRow';

export type PRCertificateProps = {
  /** New estimated 1RM (rounded int). */
  e1RM: number;
  /** Prior best e1RM the cert strikes through (rounded int, > 0). */
  prevE1RM: number;
  /** e1RM - prevE1RM, positive int (rounded). */
  delta: number;
  /** Unit token — `lb` or `kg`. */
  unit: 'lb' | 'kg';
  /** Lower-case lift name — `squat` / `bench` / `deadlift` / `press`. */
  liftLabel: string;
  testID?: string;
};

export function PRCertificate({
  e1RM,
  prevE1RM,
  delta,
  unit,
  liftLabel,
  testID,
}: PRCertificateProps) {
  const { colors, spacing, type } = useTheme();

  // Impact entrance — slides in fast, lands on a hard cubic-out, no spring
  // bounce. Uses explicit shared-value animation instead of Reanimated's
  // `entering` prop because the layout-animation registry is stateful and
  // can throw "Should not already be working" when PRCertificate remounts
  // on a second consecutive session (the prior entry isn't cleaned up
  // before the next mount tries to register the same animation).
  const translateY = useSharedValue(16);
  const opacity = useSharedValue(0);
  useEffect(() => {
    const cfg = { duration: 180, easing: Easing.out(Easing.cubic) };
    translateY.value = withTiming(0, cfg);
    opacity.value = withTiming(1, cfg);
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [translateY, opacity]);
  const enterStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const panelStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg + 2,
    paddingBottom: spacing.lg,
    backgroundColor: colors.ink0,
    position: 'relative',
  };

  return (
    <Animated.View
      testID={testID}
      style={[panelStyle, enterStyle]}
      accessibilityRole="summary"
      accessibilityLabel={`A new record on the ${liftLabel}: ${e1RM} ${unit} estimated 1RM${prevE1RM > 0 && delta > 0 ? `, stronger by ${delta} ${unit}` : ''}.`}
    >
      <CornerTicks color={colors.bg0} />

      {/* Eyebrow — ★ A NEW RECORD ★ */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
          paddingRight: 16,
        }}
      >
        <PaperCapsText variant="eyebrow">{'★  A new record  ★'}</PaperCapsText>
      </View>

      {/* Hero — Stronger. */}
      <RNText
        style={{
          fontFamily: `${type.display}-Bold`,
          fontSize: 52,
          lineHeight: 72,
          letterSpacing: -2.34,
          color: colors.bg0,
          marginBottom: 14,
        }}
      >
        Stronger
        <Text variant="sans" weight="bold" size={64} color="amber" style={{ lineHeight: 74 }}>
          .
        </Text>
      </RNText>

      <HeroNumberRow e1RM={e1RM} unit={unit} {...(testID ? { testID: `${testID}-e1rm` } : {})} />
      {prevE1RM > 0 && delta > 0 ? (
        <ComparisonRow
          prevE1RM={prevE1RM}
          delta={delta}
          unit={unit}
          {...(testID ? { testID: `${testID}-delta` } : {})}
        />
      ) : null}
      <SignOffRow liftLabel={liftLabel} />
    </Animated.View>
  );
}
