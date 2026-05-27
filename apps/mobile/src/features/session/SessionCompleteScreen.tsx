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
import { CtaBarReserve } from '@/design/primitives/CtaBarReserve';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { useTheme } from '@/design/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, type ViewStyle } from 'react-native';
import { AdjustTmCta } from './components/AdjustTmCta';
import { CycleCompleteBand } from './components/CycleCompleteBand';
import { CycleGrid } from './components/CycleGrid';
import { PRCertificate } from './components/PRCertificate';
import { ReceiptCard } from './components/ReceiptCard';
import { SeeFullRecordLink } from './components/SeeFullRecordLink';
import { SessionCompleteMasthead } from './components/SessionCompleteMasthead';
import { SessionCompleteTitle } from './components/SessionCompleteTitle';
import { SessionLayout } from './components/SessionLayout';
import { SharePrPill, buildPrShareMessage } from './components/SharePrPill';
import { TmAdjustmentNote } from './components/TmAdjustmentNote';
import { TmApplySheet } from './components/TmApplySheet';
import { TmTestReceiptBand } from './components/TmTestReceiptBand';
import { useHistoryBackHandler } from './hooks/useHistoryBackHandler';
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
  const { colors } = useTheme();
  const data = useSessionCompleteData(sessionId);

  usePrSuccessHaptic(data.view?.hasPR ?? false);

  // Defense in depth: a missing or explicitly cancelled session can't
  // render a receipt, so bounce home. A stale `'in_progress'` read from
  // the per-session cache is NOT a bounce trigger — see the
  // `cancelled` field on `SessionCompleteData` for why. The view stays
  // null until status flips to `'completed'`, so the screen renders its
  // loading chrome while we wait.
  useEffect(() => {
    if (data.loading) return;
    if (data.missing || data.cancelled) {
      goTo.home(router);
    }
  }, [data.loading, data.missing, data.cancelled, router]);

  // CRITICAL: all hooks must run on every render — keep this above any
  // early return so the React Hook rules hold. Previously `useCallback`
  // and `useHistoryBackHandler` were below an `if (!data.view) return`
  // which crashed with "Rendered more hooks than during the previous
  // render" the instant `data.view` resolved on a PR row.
  const handleBackToHistory = useCallback(() => {
    // Always navigate explicitly to /history rather than calling
    // router.back(). The tabs → session group push doesn't reliably
    // remember the originating tab — both Android hardware back and
    // router.back() can land on the home tab (or Today). Pushing the
    // tab route directly is the only stable path back to history.
    goTo.history(router);
  }, [router]);

  useHistoryBackHandler({ enabled: origin === 'history', onBack: handleBackToHistory });

  if (!data.view) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }

  const v = data.view;
  const handleClose = () => {
    // Dismiss the session stack first, then switch to Progress.
    // router.navigate('/(tabs)/progress') from inside the session group
    // does not reliably switch the active tab in the parent tabs navigator;
    // popping the session stack first reveals the tabs navigator and the
    // subsequent navigate() lands cleanly.
    // See loop-memory/12-cross-stack-navigation.md.
    //
    // `justCompleted` is the just-closed session id — the Progress screen
    // matches it against `cell.sessionId` to mount a one-shot fill-in on
    // the corresponding cell. Travels as a route param (not a module
    // singleton) so the trigger is naturally scoped to this navigation.
    if (router.canDismiss()) router.dismissAll();
    goTo.progress(router, v.session.lift, { justCompleted: sessionId });
  };

  const [tmApplyOpen, setTmApplyOpen] = useState(false);

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

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
          cycleDay={v.session.week}
        />

        {v.isCycleComplete ? <CycleCompleteBand cycle={v.session.cycle ?? 1} /> : null}

        {v.isTmTestSession ? (
          <>
            {v.tmAdjustment ? (
              <>
                <TmAdjustmentNote
                  suggestion={v.tmAdjustment}
                  tmDisplay={v.tmTestWeight}
                  unit={v.renderUnit}
                  onPress={() => setTmApplyOpen(true)}
                />
                <TmApplySheet
                  open={tmApplyOpen}
                  lift={v.lift}
                  suggestion={v.tmAdjustment}
                  tmDisplay={v.tmTestWeight}
                  unit={v.renderUnit}
                  storageUnit={v.storageUnit}
                  onClose={() => setTmApplyOpen(false)}
                />
              </>
            ) : null}
            <TmTestReceiptBand
              tmDisplay={v.tmTestWeight}
              reps={v.tmTestReps}
              unitGlyph={v.unitGlyph}
              elapsedReady={v.elapsedReady}
              elapsedValue={v.elapsedValue}
            />
          </>
        ) : (
          <>
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
                <SharePrPill
                  message={buildPrShareMessage({
                    liftLabel: v.liftLower,
                    e1RM: v.e1RMDisplay,
                    delta: v.e1RMDelta,
                    unit: v.unitGlyph,
                  })}
                />
                <AdjustTmCta delta={v.e1RMDelta} unitGlyph={v.unitGlyph} onPress={() => goTo.settings(router)} />
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
              bbbSetsCompleted={v.bbbSetsCompleted}
              bbbWeightDisplay={v.bbbWeightDisplay}
            />
          </>
        )}

        <CycleGrid
          cycle={v.session.cycle ?? 1}
          completedThisCycle={v.completedThisCycle}
          sessionsInCycle={v.sessionsInCycle}
        />

        <CtaBarReserve size="dense" />
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
            <SeeFullRecordLink onPress={() => goTo.history(router)} />
          </>
        )}
      </CtaBar>
    </SessionLayout>
  );
}
