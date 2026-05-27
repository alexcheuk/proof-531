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
import { useCallback, useEffect } from 'react';
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
import { useHistoryBackHandler } from './hooks/useHistoryBackHandler';
import { usePrSuccessHaptic } from './hooks/usePrSuccessHaptic';
import { useSessionCompleteData } from './hooks/useSessionCompleteData';
import { sessionCompletedStore } from './sessionCompletedSignal';

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
    // Discord 1508779267 — close the day now lands on Progress with a
    // one-time fill-in animation on the just-completed cell. Publish the
    // signal *before* the navigation so ProgressLiftPage sees it on its
    // own mount and the animation can play in sync with the landing.
    sessionCompletedStore.publish({ lift: v.session.lift, sessionId });
    // Pop the entire (session) stack before switching to the Progress
    // tab. Without this, `router.replace('/(tabs)/progress')` is a
    // cross-stack hop that leaves the session stack's other screens
    // mounted underneath the tab — Discord 1508935241 reported this as
    // a "black screen that can't be dismissed" after Close the day.
    if (router.canDismiss()) router.dismissAll();
    goTo.progress(router, v.session.lift, { replace: true });
  };
  const handleAdjustTm = () => goTo.settings(router);

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
          week={v.session.week}
        />

        {v.isCycleComplete ? <CycleCompleteBand cycle={v.session.cycle ?? 1} /> : null}

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
          bbbSetsCompleted={v.bbbSetsCompleted}
          bbbWeightDisplay={v.bbbWeightDisplay}
        />

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
