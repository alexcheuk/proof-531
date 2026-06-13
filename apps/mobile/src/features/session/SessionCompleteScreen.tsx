import { useClearMissState } from '@/data/queries/useClearMissState';
import { useMissState } from '@/data/queries/useMissState';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { CtaBarReserve } from '@/design/primitives/CtaBarReserve';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SecondaryLink } from '@/design/primitives/SecondaryLink';
import { useTheme } from '@/design/theme';
import { goTo } from '@/lib/routes';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { AdjustTmCta } from './components/AdjustTmCta';
import { CycleCompleteBand } from './components/CycleCompleteBand';
import { CycleGrid } from './components/CycleGrid';
import { MissCorrectionCard } from './components/MissCorrectionCard';
import { MissResetSheet } from './components/MissResetSheet';
import { PRCertificate } from './components/PRCertificate/PRCertificate';
import { ReceiptCard } from './components/ReceiptCard';
import { SessionCompleteMasthead } from './components/SessionCompleteMasthead';
import { SessionCompleteTitle } from './components/SessionCompleteTitle';
import { SessionLayout } from './components/SessionLayout';
import { SharePrPill, buildPrShareMessage } from './components/SharePrPill';
import { TmAdjustmentNote } from './components/TmAdjustmentNote';
import { TmApplySheet } from './components/TmApplySheet';
import { TmTestReceiptBand } from './components/TmTestReceiptBand';
import { useHardwareBack } from './hooks/useHardwareBack';
import { usePrSuccessHaptic } from './hooks/usePrSuccessHaptic';
import { useRecordMissOnce } from './hooks/useRecordMissOnce';
import { useSessionCompleteData } from './hooks/useSessionCompleteData';
import { useSessionCompleteHaptic } from './hooks/useSessionCompleteHaptic';
import { useStoreReviewOnCycleComplete } from './hooks/useStoreReviewOnCycleComplete';

export type SessionCompleteScreenProps = {
  sessionId: number;
  /** 'live' = just-finished flow (Close the day + share); 'history' = reviewing past (Back to history). */
  origin?: 'live' | 'history';
};

export function SessionCompleteScreen({ sessionId, origin = 'live' }: SessionCompleteScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const data = useSessionCompleteData(sessionId);
  const settingsData = useSettings();

  useSessionCompleteHaptic(data.view !== null && data.view !== undefined);
  usePrSuccessHaptic(data.view?.hasPR ?? false);

  // In-app review: prompt once per install after a full cycle completes.
  // Default true (skip) while settings are loading to prevent premature trigger.
  useStoreReviewOnCycleComplete(
    data.view?.isCycleComplete ?? false,
    settingsData.data?.storeReviewRequested ?? true,
  );

  // Missed-rep Program Correction. The one-shot recorder only acts on a
  // settled non-TM-test session (D1..D3)  -  `ready` is false for D4 and while
  // loading, so the latch never fires there. A miss increments missCount; a
  // hit clears it (literal "consecutive"). `useMissState` then drives the
  // card variant from the persisted count.
  const missLift = data.view && !data.view.isTmTestSession ? data.view.lift : null;
  useRecordMissOnce({
    sessionId,
    lift: missLift,
    isMiss: data.view?.amrapIsMiss ?? false,
    ready: data.view != null && !data.view.isTmTestSession,
  });
  const missState = useMissState(data.view?.lift ?? 'squat');
  const clearMiss = useClearMissState();
  const [missResetOpen, setMissResetOpen] = useState(false);
  // missCount drives the card's presence + variant. While loading or on error
  // the data is undefined → missCount 0 → no card, so the receipt never shifts.
  const missCount = missState.data?.missCount ?? 0;

  const certContainerRef = useRef<View>(null);
  const handleCaptureCert = useCallback(async (): Promise<string | null> => {
    if (!certContainerRef.current) return null;
    try {
      return await captureRef(certContainerRef.current, { format: 'png', quality: 1 });
    } catch {
      return null;
    }
  }, []);

  // Stale 'in_progress' reads are NOT a bounce  -  the view waits for 'completed'.
  // Missing/cancelled sessions have no receipt to show, so send the user home.
  useEffect(() => {
    if (data.loading) return;
    if (data.missing || data.cancelled) {
      goTo.home(router);
    }
  }, [data.loading, data.missing, data.cancelled, router]);

  // Keep all hooks above the early return  -  moving them below `if (!data.view)` crashes
  // with "Rendered more hooks than during the previous render" when data.view resolves.
  const handleBackToHistory = useCallback(() => {
    // router.back() is unreliable from inside the session group  -  can land on Today.
    goTo.history(router);
  }, [router]);

  useHardwareBack({ enabled: origin === 'history', onBack: handleBackToHistory });

  const [tmApplyOpen, setTmApplyOpen] = useState(false);

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
    // `justCompleted` is the just-closed session id  -  the Progress screen
    // matches it against `cell.sessionId` to mount a one-shot fill-in on
    // the corresponding cell. Travels as a route param (not a module
    // singleton) so the trigger is naturally scoped to this navigation.
    if (router.canDismiss()) router.dismissAll();
    goTo.progress(router, v.session.lift, { justCompleted: sessionId });
  };

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
                <View ref={certContainerRef} collapsable={false}>
                  <PRCertificate
                    testID="session-complete-cert"
                    e1RM={v.e1RMDisplay}
                    prevE1RM={v.prevE1RMDisplay}
                    delta={v.e1RMDelta}
                    unit={v.unitGlyph}
                    liftLabel={v.liftLower}
                  />
                </View>
                <SharePrPill
                  message={buildPrShareMessage({
                    liftLabel: v.liftLower,
                    e1RM: v.e1RMDisplay,
                    delta: v.e1RMDelta,
                    unit: v.unitGlyph,
                  })}
                  onCaptureCertificate={handleCaptureCert}
                />
                <AdjustTmCta
                  delta={v.e1RMDelta}
                  unitGlyph={v.unitGlyph}
                  onPress={() => goTo.settings(router)}
                />
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

            {missCount > 0 ? (
              <>
                <MissCorrectionCard
                  variant={missCount >= 2 ? 'forced' : 'choice'}
                  tmDisplay={v.tmDisplay}
                  unit={v.renderUnit}
                  onReset={() => {
                    void Haptics.selectionAsync();
                    setMissResetOpen(true);
                  }}
                  {...(missCount >= 2
                    ? {}
                    : {
                        onOffDay: () => {
                          void Haptics.selectionAsync();
                          clearMiss.mutate({ lift: v.lift });
                        },
                      })}
                  animateEntrance
                />
                <MissResetSheet
                  open={missResetOpen}
                  lift={v.lift}
                  tmDisplay={v.tmDisplay}
                  unit={v.renderUnit}
                  onClose={() => setMissResetOpen(false)}
                />
              </>
            ) : null}
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
            <SecondaryLink
              testID="session-complete-history-link"
              onPress={() => goTo.history(router)}
            >
              See full record →
            </SecondaryLink>
          </>
        )}
      </CtaBar>
    </SessionLayout>
  );
}
