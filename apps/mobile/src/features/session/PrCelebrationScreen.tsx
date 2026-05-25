import { goTo } from '@/app/routes';
import { StatusBarShim } from '@/design/primitives/StatusBarShim';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import { CornerTicks } from './components/PRCertificate/CornerTicks';
import { PrCelebrationCtas } from './components/PrCelebration/PrCelebrationCtas';
import { PrCelebrationHero } from './components/PrCelebration/PrCelebrationHero';
import { PrCelebrationNumbers } from './components/PrCelebration/PrCelebrationNumbers';
import { PrCelebrationSkeleton } from './components/PrCelebration/PrCelebrationSkeleton';
import { useHardwareBack } from './hooks/useHardwareBack';
import { useSessionCompleteData } from './hooks/useSessionCompleteData';

/**
 * Full-screen, inverted-color celebration shown right after an AMRAP
 * set that registers a new estimated 1RM PR.
 *
 * Visually mirrors the PR certificate so the celebration screen and the
 * later receipt cert read as the same artifact at two scales:
 *   - same ink-0 surface + corner ticks (one size larger here)
 *   - same eyebrow + hero typography
 *   - same hero-number / comparison-row layout
 *
 * The status-bar safe area is painted ink-0 by `StatusBarShim` via the
 * global tint layer in `_layout.tsx`. Earlier versions tried to escape
 * the SafeTopFrame's paper bg with a per-screen negative margin; that
 * was visually clipped by the native-stack card's `overflow: hidden`,
 * which is why the user kept reporting "still not black".
 *
 * Primary CTA "Continue →" replace-routes to the BBB prompt; secondary
 * "Skip to receipt" jumps past BBB straight to the session-complete
 * receipt. Android hardware back also pushes forward.
 */
export type PrCelebrationScreenProps = {
  sessionId: number;
};

export function PrCelebrationScreen({ sessionId }: PrCelebrationScreenProps) {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const data = useSessionCompleteData(sessionId);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const onContinue = () => goTo.bbb(router, sessionId, { replace: true });
  const onSkipToReceipt = () => goTo.complete(router, sessionId, { replace: true });

  useHardwareBack({ enabled: true, onBack: onContinue });

  const v = data.view;

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

  const hasComparison = !!v && v.prevE1RMDisplay > 0 && v.e1RMDelta > 0;

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
        <PrCelebrationHero />
        {v ? (
          <PrCelebrationNumbers
            liftLower={v.liftLower}
            e1RMDisplay={v.e1RMDisplay}
            prevE1RMDisplay={v.prevE1RMDisplay}
            e1RMDelta={v.e1RMDelta}
            unitGlyph={v.unitGlyph}
            hasComparison={hasComparison}
          />
        ) : (
          <PrCelebrationSkeleton />
        )}
      </View>

      <PrCelebrationCtas onContinue={onContinue} onSkipToReceipt={onSkipToReceipt} />
    </View>
  );
}
