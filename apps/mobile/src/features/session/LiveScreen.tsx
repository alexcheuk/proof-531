import { usePrs } from '@/data/queries/usePrs';
import { useSession } from '@/data/queries/useSession';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
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
  const { colors } = useTheme();
  const sessionQuery = useSession(sessionId);
  const prsQuery = usePrs();
  const live = useLiveScreenState(sessionId);

  // Keep the screen awake for the entire session. Activate on mount,
  // deactivate on unmount.
  useEffect(() => {
    KeepAwake.activateKeepAwake();
    return () => {
      KeepAwake.deactivateKeepAwake();
    };
  }, []);

  // After session is complete (or cancelled) route back home.
  useEffect(() => {
    if (live.phase === 'complete') {
      router.back();
    }
  }, [live.phase, router]);

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
  // mid-session per the PWA spec, but for PE-05 we render in the session's
  // snapshot unit (display falls back to storage when missing).
  const unit: Unit = session.displayUnitSnapshot ?? storageUnit;
  const existingPR = prsQuery.data?.find((p) => p.lift === lift);

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  const showSetSurface = live.phase === 'set' || live.phase === 'amrap-log';
  const showRestSurface = live.phase === 'rest';

  // Primary CTA — depends on phase. The cancel-confirm and amrap-log phases
  // still render the underlying set/rest surface, so they re-use the same
  // CTA from the phase they popped out of (handled implicitly by
  // useLiveScreenState's phaseBeforeCancelRef).
  let cta: React.ReactElement | null = null;
  if (live.phase === 'rest') {
    cta = (
      <PrimaryPillButton testID="cta-advance-rest" onPress={live.onAdvanceFromRest}>
        {live.setIndex < 2 ? 'Next set' : 'Complete session'}
      </PrimaryPillButton>
    );
  } else if (
    live.phase === 'set' ||
    live.phase === 'amrap-log' ||
    live.phase === 'cancel-confirm'
  ) {
    if (live.isAmrap) {
      cta = (
        <PrimaryPillButton testID="cta-log-amrap" onPress={live.onOpenAmrapSheet}>
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
          <RestPhase remaining={live.restRemaining} testID="rest-phase" />
        ) : showSetSurface || live.phase === 'cancel-confirm' ? (
          <>
            <LiveHeader setIndex={live.setIndex} isAmrap={live.isAmrap} testID="live-header" />
            <LiveBigWeight
              lift={lift}
              pct={live.pct}
              weight={live.prescribedWeight}
              unit={unit}
              reps={live.prescribedReps}
              amrap={live.isAmrap}
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
        prescribedWeight={live.prescribedWeight}
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
