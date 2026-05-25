import { goTo } from '@/app/routes';
import { StatusBarShim } from '@/design/primitives/StatusBarShim';
import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text as RNText, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
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

/**
 * Full-screen, inverted-color celebration shown right after an AMRAP
 * set that registers a new estimated 1RM PR.
 *
 * The intro plays *in place* on the existing layout:
 *   - The hero (eyebrow + "Stronger.") scales up to ~1.25, typewriter-
 *     reveals across both lines, then scales down to its final size.
 *   - The numbers block then scales up the same way, types "PREVIOUS
 *     BEST" + the prior value, flips the eyebrow to "NEW ESTIMATED
 *     1RM", counts the value up, then scales back to its final size.
 *   - The comparison row + CTA fade in once the numbers have settled.
 *
 * The layout never reflows — hidden blocks reserve their final-state
 * height via `opacity: 0`, so each scale-up animation reads as
 * emphasis on the same element, not a separate centered overlay.
 *
 * Status-bar safe area is painted ink-0 by `StatusBarShim` via the
 * global tint layer in `_layout.tsx`. Primary CTA "Continue →"
 * replace-routes to the BBB prompt; Android hardware back is wired
 * to the same destination.
 */
export type PrCelebrationScreenProps = {
  sessionId: number;
};

// Phase ordering — used to gate when each block opens (opacity 0 → 1)
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
  }, [target, durationMs, scale]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

function useFadeStyle(visible: boolean, durationMs = FADE_MS) {
  const opacity = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: durationMs });
  }, [visible, durationMs, opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

export function PrCelebrationScreen({ sessionId }: PrCelebrationScreenProps) {
  const { colors, spacing, type } = useTheme();
  const router = useRouter();
  const data = useSessionCompleteData(sessionId);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const onContinue = () => goTo.bbb(router, sessionId, { replace: true });
  useHardwareBack({ enabled: true, onBack: onContinue });

  const v = data.view;
  const hasComparison = !!v && v.prevE1RMDisplay > 0 && v.e1RMDelta > 0;
  const sequenceReady = !!v;

  const { phase, onTitleTyped, onPrevTyped, onTickComplete, replay } = usePrCelebrationSequence({
    hasComparison,
    ready: sequenceReady,
  });

  // ── Hero eyebrow, lift-specific. Falls back to a sane default while
  //    the session row is still loading.
  const heroEyebrow = v ? `YOU HIT A NEW ${v.lift.toUpperCase()} PR` : 'YOU HIT A NEW PR';

  // ── Typewriter for the hero. Active during type/hold so the full
  //    string stays rendered through the hold without re-blanking. The
  //    sentinel string only carries the right LENGTH — we feed the
  //    returned char count to the Hero, which slices the real text.
  const titleActive = phase === 'title-type' || phase === 'title-hold';
  const typedTitleChars = useTypewriter({
    text: 'X'.repeat(prCelebrationTypeLength(heroEyebrow)),
    charMs: 38,
    active: titleActive,
    onComplete: onTitleTyped,
  }).length;

  // ── Typewriter for the prev-best value. We type *only the number* —
  //    PrCelebrationNumbers renders the unit glyph as a sibling at its
  //    own (smaller) font size, so typing the unit characters would
  //    render them at the big number size on every intermediate tick.
  const prevValueText = v ? formatWeight(v.prevE1RMDisplay) : '';
  const prevActive = phase === 'prev-type' || phase === 'prev-hold';
  const prevValueTyped = useTypewriter({
    text: prevValueText,
    charMs: 50,
    active: prevActive,
    onComplete: onPrevTyped,
  });

  // ── Count-up from prev → new during tick-up.
  const tickActive = phase === 'tick-up';
  const tickValue = useCountUp({
    from: v?.prevE1RMDisplay ?? 0,
    to: v?.e1RMDisplay ?? 0,
    durationMs: TICK_DURATION_MS,
    active: tickActive,
    onComplete: onTickComplete,
  });

  // ── Visibility windows. Each block is in the layout from the moment
  //    its phases begin (so layout doesn't shift), gated by opacity.
  const heroVisible = phaseAtLeast(phase, 'title-type');
  const numbersVisible = phaseAtLeast(phase, 'prev-type');
  const ctaVisible = phase === 'final';

  // ── Scale targets. Each block scales up to emphasis while its
  //    intro phases run, then back to normal once that block has
  //    settled.
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

  // ── Eyebrow transition: backspace "PREVIOUS BEST" then retype
  //    "NEW ESTIMATED 1RM" the moment the tick-up phase begins. The
  //    transition runs in parallel with the count-up; at ~45ms/char and
  //    30 characters of total work, the label settles ~1.35s into the
  //    2.5s tick. "NEW ESTIMATED 1RM" is also the permanent final-state
  //    eyebrow (rendered by PrCelebrationNumbers' default), so the
  //    label never has to reset after tick-up.
  const eyebrowTarget =
    phase === 'tick-up'
      ? PR_CELEBRATION_FINAL_EYEBROW
      : phase === 'prev-type' || phase === 'prev-hold'
        ? PREV_EYEBROW
        : PREV_EYEBROW;
  const eyebrowTransitionActive =
    phase === 'prev-type' || phase === 'prev-hold' || phase === 'tick-up';
  const animatedEyebrow = useTypewriterTransition({
    text: eyebrowTarget,
    charMs: EYEBROW_CHAR_MS,
    active: eyebrowTransitionActive,
  });

  // ── Numbers content overrides per phase. Values are unit-stripped —
  //    PrCelebrationNumbers renders the unit glyph as a sibling.
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

  // Hero typewriter prop — when not in title phases, render fully.
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

  return (
    <View style={surfaceStyle} testID="pr-celebration">
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
        <CornerTicks color={colors.bg0} size={28} thickness={2} />
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
             * layout stable across phase changes — its own internal
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

      <Animated.View style={ctaOpacityStyle}>
        <PrCelebrationCtas onContinue={onContinue} />
      </Animated.View>

      {/* TEMP: dev-only replay trigger so the sequence can be previewed
       * without going back through the AMRAP flow each time. Last child
       * of the surface so RN's source-order stacking puts it on top of
       * everything else. Remove before shipping. */}
      <Pressable
        testID="pr-celebration-replay"
        accessibilityRole="button"
        accessibilityLabel="Replay PR celebration animation"
        onPress={replay}
        hitSlop={12}
        style={({ pressed }) => ({
          position: 'absolute',
          top: spacing.lg,
          right: spacing.lg,
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor: colors.bg0,
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <RNText
          style={{
            fontFamily: `${type.mono}-Bold`,
            fontSize: 12,
            letterSpacing: 1.4,
            color: colors.ink0,
          }}
        >
          REPLAY
        </RNText>
      </Pressable>
    </View>
  );
}
