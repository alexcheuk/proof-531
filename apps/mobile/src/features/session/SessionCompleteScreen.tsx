/**
 * Session complete screen — the "stamped receipt" surface shown after the
 * Live screen completes (or the Today Complete pill is tapped).
 *
 * Composition shell only — view derivation lives in
 * `useSessionCompleteData`, sub-blocks (masthead, title, PR certificate,
 * receipt, cycle grid) live in their own files. The PR success haptic is
 * fired by `usePrSuccessHaptic`.
 */
import { goTo } from '@/app/routes';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { useTheme } from '@/design/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text as RNText, ScrollView, type TextStyle, View, type ViewStyle } from 'react-native';
import { AdjustTmCta } from './components/AdjustTmCta';
import { CycleGrid } from './components/CycleGrid';
import { PRCertificate } from './components/PRCertificate';
import { ReceiptCard } from './components/ReceiptCard';
import { SessionCompleteMasthead } from './components/SessionCompleteMasthead';
import { SessionCompleteTitle } from './components/SessionCompleteTitle';
import { SessionLayout } from './components/SessionLayout';
import { usePrSuccessHaptic } from './hooks/usePrSuccessHaptic';
import { useSessionCompleteData } from './hooks/useSessionCompleteData';

export type SessionCompleteScreenProps = {
  sessionId: number;
  /**
   * Where the user arrived from. Drives which CTAs render in the bottom
   * bar:
   *   - `live` (default) — just-finished flow → "Close the day" primary +
   *     "See full record →" secondary link.
   *   - `history` — reviewing a past session → single "Back to history"
   *     primary, no secondary link.
   */
  origin?: 'live' | 'history';
};

export function SessionCompleteScreen({ sessionId, origin = 'live' }: SessionCompleteScreenProps) {
  const router = useRouter();
  const { colors, type } = useTheme();
  const data = useSessionCompleteData(sessionId);

  usePrSuccessHaptic(data.view?.hasPR ?? false);

  // Defense in depth: deep-link / manual route into this screen for a
  // cancelled or in-progress session bounces home rather than rendering the
  // success masthead over a non-completed session.
  useEffect(() => {
    if (data.loading) return;
    if (data.missing || data.notCompleted) {
      goTo.home(router);
    }
  }, [data.loading, data.missing, data.notCompleted, router]);

  if (!data.view) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }

  const v = data.view;
  const handleClose = () => goTo.home(router);
  const handleAdjustTm = () => goTo.settings(router);
  const handleBackToHistory = () => {
    if (router.canGoBack()) router.back();
    else goTo.history(router);
  };

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };
  const secondaryLinkStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  };

  return (
    <SessionLayout>
      <StatusBar style="dark" />
      <ScrollView
        testID="session-complete-scroll"
        style={scrollStyle}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <SessionCompleteMasthead />

        <SessionCompleteTitle
          completedThisCycle={v.completedThisCycle}
          eyebrowDate={v.eyebrowDate}
          weekday={v.stampParts.weekday}
          dateLine={v.stampParts.dateLine}
          year={v.stampParts.year}
          showCertificate={v.showCertificate}
          liftLower={v.liftLower}
          week={v.session.week}
        />

        {v.showCertificate ? (
          <>
            <PRCertificate
              testID="session-complete-cert"
              e1RM={v.e1RMDisplay}
              prevE1RM={v.prevE1RMDisplay}
              delta={v.e1RMDelta}
              unit={v.unitGlyph}
              liftLabel={v.liftLower}
            />
            <AdjustTmCta delta={v.e1RMDelta} unitGlyph={v.unitGlyph} onPress={handleAdjustTm} />
          </>
        ) : null}

        <ReceiptCard
          topWeight={v.topWeight}
          topReps={v.topReps}
          topIsAmrap={v.topIsAmrap}
          e1RMDisplay={v.e1RMDisplay}
          workingVolume={v.workingVolume}
          elapsedReady={v.elapsedReady}
          elapsedValue={v.elapsedValue}
          unitGlyph={v.unitGlyph}
        />

        <CycleGrid
          cycle={v.session.cycle ?? 1}
          completedThisCycle={v.completedThisCycle}
          sessionsInCycle={v.sessionsInCycle}
        />

        {/* Reserve room above the sticky CtaBar so receipt isn't clipped. */}
        <View style={{ height: 140 }} />
      </ScrollView>
      <CtaBar>
        {origin === 'history' ? (
          <PrimaryPillButton
            testID="session-complete-back-to-history"
            glyph="←"
            onPress={handleBackToHistory}
          >
            Back to history
          </PrimaryPillButton>
        ) : (
          <>
            <PrimaryPillButton testID="session-complete-close" onPress={handleClose}>
              Close the day
            </PrimaryPillButton>
            <RNText
              testID="session-complete-history-link"
              accessibilityRole="button"
              onPress={() => goTo.history(router)}
              style={secondaryLinkStyle}
            >
              See full record →
            </RNText>
          </>
        )}
      </CtaBar>
    </SessionLayout>
  );
}
