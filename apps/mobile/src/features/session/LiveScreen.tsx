import { usePrs } from '@/data/queries/usePrs';
import { useSession } from '@/data/queries/useSession';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { useTheme } from '@/design/theme';
import { decompose } from '@/domain/plates';
import type { Lift, PlateSet, Unit } from '@/domain/types';
import { convertWeight, displayWeight } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
import * as KeepAwake from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
/**
 * Live screen — runs the user through three working sets with a countdown
 * rest timer between sets, an AMRAP bottom sheet for the top set, and a
 * cancel-confirm bottom sheet for destructive exits.
 *
 * Structural port of `~/Development/531-pwa/src/features/session/LiveScreen.tsx`.
 *
 * Behavior tied to PE-05 done_when:
 *   - `expo-keep-awake` is held active while the screen is mounted (the screen
 *     stays on during the entire session).
 *   - Rest timer counts DOWN from REST_SECONDS. At T-3s the warning haptic
 *     fires; at T-0 the chime plays. Both side effects are driven by
 *     `useLiveScreenState`.
 *   - Cancel button → CancelConfirmSheet. The destructive button uses a
 *     two-tap pattern: first tap arms (fires warning haptic), second tap
 *     actually cancels.
 *   - AmrapLogSheet uses `@gorhom/bottom-sheet` (via the shared `Sheet`
 *     primitive) and saves through `appendSetLog`.
 *
 * Boundary: composes design primitives + feature-local hook + data accessors.
 * No hex/px literals; no direct drizzle imports.
 */
import { useEffect } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { AmrapLogSheet } from './components/AmrapLogSheet';
import { CancelConfirmSheet } from './components/CancelConfirmSheet';
import { LiveBigWeight } from './components/LiveBigWeight';
import { LiveHeader } from './components/LiveHeader';
import { RestPhase } from './components/RestPhase';
import { SessionLayout } from './components/SessionLayout';
import { SessionTopBar } from './components/SessionTopBar';
import { useLiveScreenState } from './hooks/useLiveScreenState';

export type LiveScreenProps = {
  sessionId: number;
};

export function LiveScreen({ sessionId }: LiveScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const sessionQuery = useSession(sessionId);
  const prsQuery = usePrs();
  const settingsQuery = useSettings();
  const restSeconds = settingsQuery.data?.restTargetSeconds;
  const live = useLiveScreenState(sessionId, restSeconds !== undefined ? { restSeconds } : {});

  // Keep the screen awake for the entire session. Activate on mount,
  // deactivate on unmount.
  useEffect(() => {
    KeepAwake.activateKeepAwake();
    return () => {
      KeepAwake.deactivateKeepAwake();
    };
  }, []);

  // After the session machine settles into `complete` (via normal finish OR
  // cancel), invalidate the session-shaped queries so Home/History refetch,
  // then route away. A cancelled session routes home (no celebration
  // surface); a completed session routes to the receipt. Doing the
  // invalidation here (rather than inside the hook) keeps the hook
  // driver-agnostic. A .catch redirect-home fallback guarantees the screen
  // never gets stranded if any invalidate rejects.
  const sessionStatus = sessionQuery.data?.status;
  useEffect(() => {
    if (live.phase !== 'complete' || sessionId == null) return;
    // Snapshot the status at the moment we enter `complete` — the exit
    // gate below is gated off so it can't fire a competing replace.
    const destination =
      sessionStatus === 'cancelled'
        ? ('/' as const)
        : ({
            pathname: '/session/complete' as const,
            params: { sessionId: String(sessionId) },
          } as const);
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['activeSession'] }),
      queryClient.invalidateQueries({ queryKey: ['sessions'] }),
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
    ])
      .then(() => {
        // biome-ignore lint/suspicious/noExplicitAny: typedRoutes disabled
        router.replace(destination as any);
      })
      .catch((err) => {
        console.error('LiveScreen complete-flow invalidation failed', err);
        // Fallback: route somewhere recoverable so the user isn't stranded
        // on an empty surface waiting for a redirect that will never come.
        // biome-ignore lint/suspicious/noExplicitAny: typedRoutes disabled
        router.replace(destination as any);
      });
  }, [live.phase, sessionId, sessionStatus, queryClient, router]);

  // Exit gate: if the session row disappears (deleted) or transitions out
  // of `in_progress` from elsewhere (e.g. cancelled by another surface),
  // bounce home. Skipped while still loading and while we're already
  // mid-`complete` flow (the effect above owns routing in that case, so
  // this would race it).
  useEffect(() => {
    if (sessionQuery.isLoading) return;
    if (live.phase === 'complete') return;
    if (sessionQuery.data === null) {
      router.replace('/' as never);
      return;
    }
    if (sessionStatus && sessionStatus !== 'in_progress') {
      router.replace('/' as never);
    }
  }, [sessionQuery.isLoading, sessionQuery.data, sessionStatus, live.phase, router]);

  if (!sessionQuery.data) {
    // Loading or unknown session — render the layout chrome so the page
    // doesn't flash white. The Today CTA is the only entry point so a
    // truly missing session is an error path that resolves by going home.
    return (
      <SessionLayout>
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }

  const session = sessionQuery.data;
  const lift = session.lift as Lift;
  const storageUnit: Unit = session.storageUnitSnapshot ?? 'lbs';
  // Display unit isn't tracked on the live screen here — settings may flip
  // mid-session per the PWA spec, but the snapshot taken at createSession
  // is the contract for this session's render unit. Falls back to the
  // storage unit when the snapshot column is null.
  const unit: Unit = session.displayUnitSnapshot ?? storageUnit;
  // Convert the storage-snapped prescribed weight into the session's
  // display currency. When storage === display this is identity; when
  // they diverge (post-migration on an in-flight session) the user sees
  // the snapped destination-unit weight.
  const prescribedDisplay = displayWeight(live.prescribedWeight, storageUnit, unit);
  // Per-side plate decomposition. Decompose against the *storage* weight
  // and a plate-set matched to the storage unit so the breakdown is
  // physically correct (lb plates on a lb-storage TM produce a 45-lb bar +
  // lb plates regardless of which currency the user is viewing in).
  const plateSet: PlateSet =
    settingsQuery.data?.plateSet ?? (storageUnit === 'kg' ? 'kg-standard' : 'standard');
  const perSide = decompose(live.prescribedWeight, plateSet).perSide;
  const existingPR = prsQuery.data?.find((p) => p.lift === lift);

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  const showSetSurface = live.phase === 'set' || live.phase === 'amrap-log';
  const showRestSurface = live.phase === 'rest';

  // Primary CTA — depends on phase. The cancel-confirm and amrap-log phases
  // still render the underlying set/rest surface, so they re-use the same
  // CTA from the phase they popped out of (handled implicitly by
  // useLiveScreenState's phaseBeforeCancelRef).
  // CTA labels mirror the ref's `LiveScreen` logic exactly:
  //   ready phase, working set → "Set complete" (✓)
  //   ready phase, AMRAP set   → "Log AMRAP"   (→)
  //   rest phase, has next set → "Next set"    (→)
  //   rest phase, terminal     → "Complete session" (→)
  let cta: React.ReactElement | null = null;
  if (live.phase === 'rest') {
    const hasNext = live.setIndex < 2;
    cta = (
      <PrimaryPillButton testID="cta-advance-rest" glyph="→" onPress={live.onAdvanceFromRest}>
        {hasNext ? 'Next set' : 'Complete session'}
      </PrimaryPillButton>
    );
  } else if (
    live.phase === 'set' ||
    live.phase === 'amrap-log' ||
    live.phase === 'cancel-confirm'
  ) {
    if (live.isAmrap) {
      cta = (
        <PrimaryPillButton testID="cta-log-amrap" glyph="→" onPress={live.onOpenAmrapSheet}>
          Log AMRAP
        </PrimaryPillButton>
      );
    } else {
      cta = (
        <PrimaryPillButton testID="cta-log-working" glyph="✓" onPress={live.onLogWorkingSet}>
          Set complete
        </PrimaryPillButton>
      );
    }
  }

  return (
    <SessionLayout>
      <StatusBar style="dark" />
      <SessionTopBar
        onBack={() => router.back()}
        backLabel="Back to plan"
        rightAction={{ kind: 'cancel', onPress: live.onRequestCancel }}
      />
      <ScrollView
        testID="live-scroll"
        style={scrollStyle}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {showRestSurface ? (
          <RestPhase
            loggedWeight={
              live.lastLogged
                ? displayWeight(live.lastLogged.weight, storageUnit, unit)
                : prescribedDisplay
            }
            loggedReps={live.lastLogged?.reps ?? live.prescribedReps}
            loggedUnit={unit}
            isAmrap={live.lastLogged?.isAmrap ?? false}
            estimated1RM={
              live.lastLogged?.estimated1RM !== undefined
                ? Math.round(convertWeight(live.lastLogged.estimated1RM, storageUnit, unit))
                : undefined
            }
            remaining={live.restRemaining}
            target={live.restTarget}
            testID="rest-phase"
          />
        ) : showSetSurface || live.phase === 'cancel-confirm' ? (
          <>
            <LiveHeader setIndex={live.setIndex} isAmrap={live.isAmrap} testID="live-header" />
            <LiveBigWeight
              lift={lift}
              pct={live.pct}
              weight={prescribedDisplay}
              unit={unit}
              reps={live.prescribedReps}
              amrap={live.isAmrap}
              perSide={perSide}
              testID="live-big-weight"
            />
          </>
        ) : null}
        <View style={{ height: 120 }} />
      </ScrollView>
      {cta ? <CtaBar>{cta}</CtaBar> : null}

      <AmrapLogSheet
        open={live.phase === 'amrap-log'}
        lift={lift}
        prescribedWeight={prescribedDisplay}
        prescribedReps={live.prescribedReps}
        unit={unit}
        existingBestE1RM={existingPR?.bestE1RM}
        onCancel={live.onCancelAmrapSheet}
        onSave={live.onSaveAmrap}
        testID="amrap-sheet"
      />

      <CancelConfirmSheet
        open={live.phase === 'cancel-confirm'}
        armed={live.cancelArmed}
        onConfirmFirstTap={live.onConfirmCancelFirstTap}
        onConfirmSecondTap={live.onConfirmCancelSecondTap}
        onDismiss={live.onDismissCancelSheet}
        testID="cancel-confirm-sheet"
      />
    </SessionLayout>
  );
}
