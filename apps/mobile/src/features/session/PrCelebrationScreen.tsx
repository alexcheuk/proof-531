import { goTo } from '@/app/routes';
import { StatusBarShim } from '@/design/primitives/StatusBarShim';
import { useTheme } from '@/design/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
 *   - same ink-0 surface + corner ticks
 *   - same eyebrow + hero typography
 *   - same hero-number / comparison-row layout
 *
 * Escapes the root SafeTopFrame's paper-bg top stripe with a negative
 * margin so the ink-0 surface extends behind the status bar — light-mode
 * glyphs render cleanly on the dark canvas without a paper sliver above.
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = useSessionCompleteData(sessionId);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const onContinue = () => goTo.bbb(router, sessionId, { replace: true });
  const onSkipToReceipt = () => goTo.complete(router, sessionId, { replace: true });

  useHardwareBack({ enabled: true, onBack: onContinue });

  const v = data.view;

  // Escape the root SafeTopFrame's paper top stripe so the ink-0 canvas
  // runs edge-to-edge under the status bar.
  const surfaceStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.ink0,
    marginTop: -insets.top,
    paddingTop: insets.top,
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
      {/* Corner-tick frame that mirrors the PR certificate panel — but at
          screen scale, so the celebration reads as one big certificate. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: insets.top + spacing.md,
          left: spacing.md,
          right: spacing.md,
          bottom: spacing.md,
        }}
      >
        <CornerTicks color={colors.bg0} />
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
