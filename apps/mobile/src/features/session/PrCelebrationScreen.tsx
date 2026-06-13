import { StatusBarShim } from '@/design/primitives/StatusBarShim';
import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import { longPulseVibrate } from '@/lib/haptics';
import { goTo } from '@/lib/routes';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CornerTicks } from './components/PRCertificate/CornerTicks';
import { PAPER_28 } from './components/PRCertificate/paperTints';
import { PrCelebrationComparison } from './components/PrCelebration/PrCelebrationComparison';
import { PrCelebrationCtas } from './components/PrCelebration/PrCelebrationCtas';
import {
  PrCelebrationHero,
  prCelebrationTypeLength,
} from './components/PrCelebration/PrCelebrationHero';
import {
  PR_CELEBRATION_FINAL_EYEBROW,
  PrCelebrationNumbers,
} from './components/PrCelebration/PrCelebrationNumbers';
import { PrCelebrationSkeleton } from './components/PrCelebration/PrCelebrationSkeleton';
import {
  useCountUp,
  useTypewriter,
  useTypewriterTransition,
} from './components/PrCelebration/animationHooks';
import {
  type Phase,
  usePrCelebrationSequence,
} from './components/PrCelebration/usePrCelebrationSequence';
import { useHardwareBack } from './hooks/useHardwareBack';
import { useSessionCompleteData } from './hooks/useSessionCompleteData';

export type PrCelebrationScreenProps = {
  sessionId: number;
};

// Phase ordering  -  used to gate when each block opens (opacity 0 → 1)
// and when CTAs reveal themselves.
const PHASE_ORDER: Phase[] = [
  'idle',
  'title-type',
  'title-hold',
  'title-settle',
  'prev-type',
  'prev-hold',
  'tick-up',
  'numbers-settle',
  'final',
];

function phaseAtLeast(phase: Phase, target: Phase): boolean {
  return PHASE_ORDER.indexOf(phase) >= PHASE_ORDER.indexOf(target);
}

const SCALE_EMPHASIS = 1.25;
const SCALE_NORMAL = 1;
const SCALE_MS = 380;
const FADE_MS = 320;
const TICK_DURATION_MS = 2500;
const EYEBROW_CHAR_MS = 45;
const PREV_EYEBROW = 'PREVIOUS BEST';

function useScaleStyle(target: number, durationMs = SCALE_MS) {
  const scale = useSharedValue(target);
  useEffect(() => {
    scale.value = withTiming(target, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
    // Cancel in-flight withTiming on unmount so Reanimated doesn't try to
    // drive a detached shared value on the 2nd+ session mount.
    return () => {
      cancelAnimation(scale);
    };
  }, [target, durationMs, scale]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

function useFadeStyle(visible: boolean, durationMs = FADE_MS) {
  const opacity = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: durationMs });
    return () => {
      cancelAnimation(opacity);
    };
  }, [visible, durationMs, opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

export function PrCelebrationScreen({ sessionId }: PrCelebrationScreenProps) {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const data = useSessionCompleteData(sessionId);

  useEffect(() => {
    longPulseVibrate();
  }, []);

  const onContinue = () => goTo.bbb(router, sessionId, { replace: true });
  useHardwareBack({ enabled: true, onBack: onContinue });

  const v = data.view;
  const hasComparison = !!v && v.prevE1RMDisplay > 0 && v.e1RMDelta > 0;
  const sequenceReady = !!v;

  const { phase, onTitleTyped, onPrevTyped, onTickComplete, skip } = usePrCelebrationSequence({
    hasComparison,
    ready: sequenceReady,
  });

  const heroEyebrow = v ? `YOU HIT A NEW ${v.lift.toUpperCase()} PR` : 'YOU HIT A NEW PR';

  // Sentinel string carries only the LENGTH; Hero slices the real text by char count.
  const titleActive = phase === 'title-type' || phase === 'title-hold';
  const typedTitleChars = useTypewriter({
    text: 'X'.repeat(prCelebrationTypeLength(heroEyebrow)),
    charMs: 38,
    active: titleActive,
    onComplete: onTitleTyped,
  }).length;

  // Type only the number  -  unit glyph renders as a smaller sibling, not part of the typed string.
  const prevValueText = v ? formatWeight(v.prevE1RMDisplay) : '';
  const prevActive = phase === 'prev-type' || phase === 'prev-hold';
  const prevValueTyped = useTypewriter({
    text: prevValueText,
    charMs: 50,
    active: prevActive,
    onComplete: onPrevTyped,
  });

  const tickActive = phase === 'tick-up';
  const tickValue = useCountUp({
    from: v?.prevE1RMDisplay ?? 0,
    to: v?.e1RMDisplay ?? 0,
    durationMs: TICK_DURATION_MS,
    active: tickActive,
    onComplete: onTickComplete,
  });

  // In layout before visible so the dimensions are reserved and the layout never reflows.
  const heroVisible = phaseAtLeast(phase, 'title-type');
  const numbersVisible = phaseAtLeast(phase, 'prev-type');
  const ctaVisible = phase === 'final';

  const heroScaleTarget =
    phase === 'title-type' || phase === 'title-hold' ? SCALE_EMPHASIS : SCALE_NORMAL;
  const numbersScaleTarget =
    phase === 'prev-type' || phase === 'prev-hold' || phase === 'tick-up'
      ? SCALE_EMPHASIS
      : SCALE_NORMAL;

  const heroOpacityStyle = useFadeStyle(heroVisible);
  const numbersOpacityStyle = useFadeStyle(numbersVisible);
  const ctaOpacityStyle = useFadeStyle(ctaVisible);
  const heroScaleStyle = useScaleStyle(heroScaleTarget);
  const numbersScaleStyle = useScaleStyle(numbersScaleTarget);

  // Eyebrow backspace-and-retypes in parallel with count-up; FINAL_EYEBROW is the permanent state so no reset needed.
  const eyebrowTarget = phase === 'tick-up' ? PR_CELEBRATION_FINAL_EYEBROW : PREV_EYEBROW;
  const eyebrowTransitionActive =
    phase === 'prev-type' || phase === 'prev-hold' || phase === 'tick-up';
  const animatedEyebrow = useTypewriterTransition({
    text: eyebrowTarget,
    charMs: EYEBROW_CHAR_MS,
    active: eyebrowTransitionActive,
  });

  let numbersEyebrow: string | undefined;
  let numbersValue: string | undefined;
  if (phase === 'prev-type' || phase === 'prev-hold') {
    numbersEyebrow = animatedEyebrow;
    numbersValue = prevValueTyped;
  } else if (phase === 'tick-up') {
    numbersEyebrow = animatedEyebrow;
    numbersValue = v ? formatWeight(tickValue) : undefined;
  }

  // Comparison row is always mounted (to reserve its space in the
  // centered body layout); it only reveals itself at phase === 'final'.
  const comparisonVisible = phase === 'final';

  // Hero typewriter prop  -  when not in title phases, render fully.
  const heroTypedChars = phase === 'title-type' ? typedTitleChars : undefined;

  const surfaceStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.ink0,
  };

  const bodyStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    justifyContent: 'center',
  };

  // Discord 1508779690  -  tapping during the intro sequence fast-forwards
  // to the next animated phase. Disabled once we're at `final` so taps
  // don't shadow the CTA button (which has its own Pressable).
  const skipEnabled = phase !== 'final';

  return (
    <Pressable
      style={surfaceStyle}
      onPress={skip}
      disabled={!skipEnabled}
      testID="pr-celebration"
      accessibilityRole="button"
      accessibilityLabel="Skip animation"
    >
      <StatusBarShim color={colors.ink0} style="light" />
      {/* Corner-tick frame at SCREEN scale (size 28 vs the cert's 14)
       * so the celebration reads as one big certificate. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: spacing.md,
          left: spacing.md,
          right: spacing.md,
          bottom: spacing.md,
        }}
      >
        <CornerTicks color={colors.bg0} size={28} thickness={2} hideBottom />
      </View>

      <View style={bodyStyle}>
        {v ? (
          <>
            <Animated.View
              style={[
                { transformOrigin: 'left center' as const },
                heroOpacityStyle,
                heroScaleStyle,
              ]}
            >
              <PrCelebrationHero
                eyebrow={heroEyebrow}
                {...(heroTypedChars !== undefined ? { typedChars: heroTypedChars } : {})}
              />
            </Animated.View>
            {/* Non-scaled top border. Lives outside the scaled wrapper
             * so the 1.25× emphasis on the numbers doesn't extend the
             * hairline past the right edge of the screen. Same opacity
             * driver as the numbers block so they fade in together. */}
            <Animated.View
              style={[
                numbersOpacityStyle,
                {
                  marginTop: spacing.xl,
                  height: 1,
                  backgroundColor: PAPER_28,
                },
              ]}
            />
            <Animated.View
              style={[
                { transformOrigin: 'left center' as const },
                numbersOpacityStyle,
                numbersScaleStyle,
              ]}
            >
              <PrCelebrationNumbers
                e1RMDisplay={v.e1RMDisplay}
                unitGlyph={v.unitGlyph}
                {...(numbersEyebrow !== undefined ? { eyebrowOverride: numbersEyebrow } : {})}
                {...(numbersValue !== undefined ? { valueOverride: numbersValue } : {})}
                hideTopBorder
              />
            </Animated.View>
            {/* Comparison row lives outside the scaled wrapper so the
             * 1.25× emphasis on the e1RM block doesn't push the
             * "Previous best · Stronger by" hairline + content off
             * the right edge. Always mounted to keep the centered body
             * layout stable across phase changes  -  its own internal
             * animation handles the left-to-right reveal at 'final'. */}
            {hasComparison ? (
              <Animated.View style={numbersOpacityStyle}>
                <PrCelebrationComparison
                  prevE1RMDisplay={v.prevE1RMDisplay}
                  e1RMDelta={v.e1RMDelta}
                  unitGlyph={v.unitGlyph}
                  visible={comparisonVisible}
                />
              </Animated.View>
            ) : null}
          </>
        ) : (
          <PrCelebrationSkeleton />
        )}
      </View>

      {/* CTA stays in the tree from the start (to reserve its layout
       * height) but only accepts touches once the intro sequence has
       * settled. Without this, a tap meant to skip during the intro
       * would land on the hidden Continue button and bypass everything. */}
      <Animated.View style={ctaOpacityStyle} pointerEvents={ctaVisible ? 'auto' : 'none'}>
        <PrCelebrationCtas onContinue={onContinue} />
      </Animated.View>
    </Pressable>
  );
}
