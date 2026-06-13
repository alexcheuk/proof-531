import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { missResetTm } from '@/domain/progression';
import type { Unit } from '@/domain/types';
import { displayUnit } from '@/domain/units';
import { useEffect, useRef } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type MissCorrectionVariant = 'choice' | 'forced';

export type MissCorrectionCardProps = {
  variant: MissCorrectionVariant;
  /** Current TM in display units, drives the reset target line. */
  tmDisplay: number;
  unit: Unit;
  onReset: () => void;
  /** Absent on the forced variant (no off-day once two misses stack). */
  onOffDay?: () => void;
  animateEntrance?: boolean;
  testID?: string;
};

export function MissCorrectionCard({
  variant,
  tmDisplay,
  unit,
  onReset,
  onOffDay,
  animateEntrance = false,
  testID = 'miss-correction-card',
}: MissCorrectionCardProps) {
  const { colors, spacing, motion } = useTheme();
  const reduceMotion = useReducedMotion();

  const isForced = variant === 'forced';
  const u = displayUnit(unit);
  const target = missResetTm(tmDisplay, unit);

  const cardStyle: ViewStyle = {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md + 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: isForced ? 'transparent' : colors.lineStrong,
    backgroundColor: isForced ? colors.amber : undefined,
  };

  const eyebrowColor = isForced ? ('paperMuted' as const) : ('ink2' as const);
  const bodyColor = isForced ? ('paper' as const) : ('ink0' as const);
  const detailColor = isForced ? ('paperMuted' as const) : ('ink3' as const);

  const eyebrow = isForced ? 'Second miss · reset recommended' : 'Missed reps · 5/3/1 says reset';
  const body = isForced ? 'Two misses in a row' : 'You fell short of the target';
  const resetLabel = `−10% · reset to ${target} ${u}`;

  // Entrance is only animated when the miss just occurred AND reduce-motion is off.
  // Uses explicit useSharedValue instead of `entering=FadeIn` to avoid the
  // Reanimated registry "Should not already be working" crash on remount.
  const shouldAnimate = animateEntrance && !reduceMotion;
  const opacity = useSharedValue(shouldAnimate ? 0 : 1);
  const firedRef = useRef(false);
  useEffect(() => {
    if (!shouldAnimate || firedRef.current) return;
    firedRef.current = true;
    opacity.value = withTiming(1, {
      duration: motion.durationBase,
      easing: Easing.bezier(...motion.easeStandardBezier),
    });
    return () => cancelAnimation(opacity);
  }, [shouldAnimate, opacity, motion.durationBase, motion.easeStandardBezier]);
  const enteringStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const content = (
    <>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${eyebrow}. ${body}. Recommended reset to ${target} ${u}.`}
      >
        <CapsLabel size="sm" weight="semibold" color={eyebrowColor} style={{ marginBottom: 4 }}>
          {eyebrow}
        </CapsLabel>
        <Text
          variant="sans"
          weight="bold"
          size={17}
          color={bodyColor}
          style={{ letterSpacing: -0.34 }}
          testID={`${testID}-body`}
        >
          {body}
        </Text>
        <CapsLabel size="xs" color={detailColor} style={{ marginTop: 4 }}>
          {resetLabel}
        </CapsLabel>
      </View>

      <Row gap="sm" style={{ marginTop: spacing.md }}>
        <Pressable
          testID={`${testID}-reset`}
          accessibilityRole="button"
          accessibilityLabel={
            isForced
              ? `Second consecutive miss. Review the recommended 10 percent reset to ${target} ${u}.`
              : `Reset training max by 10 percent to ${target} ${u}`
          }
          accessibilityHint="Opens a sheet to review and apply the reset."
          onPress={onReset}
          style={({ pressed }) => [
            { minHeight: 44, justifyContent: 'center' },
            pressed ? { opacity: 0.6 } : null,
          ]}
        >
          <CapsLabel
            size="md"
            weight="semibold"
            color={isForced ? 'paper' : 'ink0'}
            style={{ letterSpacing: 1.8 }}
          >
            {isForced ? 'Review reset' : 'Reset −10%'}
          </CapsLabel>
        </Pressable>

        {!isForced && onOffDay ? (
          <Pressable
            testID={`${testID}-off-day`}
            accessibilityRole="button"
            accessibilityLabel="Take an off-day, keep the current training max"
            accessibilityHint="Dismisses the suggestion without changing your training max."
            onPress={onOffDay}
            style={({ pressed }) => [
              { minHeight: 44, justifyContent: 'center', marginLeft: spacing.md },
              pressed ? { opacity: 0.6 } : null,
            ]}
          >
            <CapsLabel size="md" weight="semibold" color="ink2" style={{ letterSpacing: 1.8 }}>
              Off-day
            </CapsLabel>
          </Pressable>
        ) : null}
      </Row>
    </>
  );

  return (
    <Animated.View testID={testID} style={[cardStyle, enteringStyle]}>
      {content}
    </Animated.View>
  );
}
