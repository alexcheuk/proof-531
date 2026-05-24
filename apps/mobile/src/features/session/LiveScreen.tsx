import { usePrs } from '@/data/queries/usePrs';
import { useSession } from '@/data/queries/useSession';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
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
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { decompose } from '@/domain/plates';
import type { Lift, PlateSet, Unit } from '@/domain/types';
import { displayWeight } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as KeepAwake from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { AmrapLogSheet } from './components/AmrapLogSheet';
import { CancelConfirmSheet } from './components/CancelConfirmSheet';
import { LiveBigWeight } from './components/LiveBigWeight';
import { LiveHeader } from './components/LiveHeader';
import { RestPhase } from './components/RestPhase';
import { SessionLayout } from './components/SessionLayout';
import { SessionTopBar } from './components/SessionTopBar';
import { WorkingSetLogSheet } from './components/WorkingSetLogSheet';
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
  // cancel — `cancelSession` also transitions to `complete`), invalidate the
  // session-shaped queries so Home/History refetch, then route to the
  // session-complete screen. Doing the invalidation here (rather than inside
  // the hook) keeps the hook driver-agnostic.
  useEffect(() => {
    if (live.phase !== 'complete' || sessionId == null) return;
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['activeSession'] }),
      queryClient.invalidateQueries({ queryKey: ['sessions'] }),
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] }),
    ]).then(() => {
      router.replace({
        pathname: '/session/complete',
        params: { sessionId: String(sessionId) },
        // biome-ignore lint/suspicious/noExplicitAny: typedRoutes disabled
      } as any);
    });
  }, [live.phase, sessionId, queryClient, router]);

  // Exit gate: if the session row disappears (deleted) or transitions out of
  // `in_progress` from elsewhere (cancelled/completed in another surface),
  // bounce home. Skip while the query is still loading so the loading-state
  // chrome below renders without a spurious redirect.
  const sessionStatus = sessionQuery.data?.status;
  useEffect(() => {
    if (sessionQuery.isLoading) return;
    if (sessionQuery.data === undefined) {
      router.replace('/' as never);
      return;
    }
    if (sessionStatus && sessionStatus !== 'in_progress') {
      router.replace('/' as never);
    }
  }, [sessionQuery.isLoading, sessionQuery.data, sessionStatus, router]);

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
  // Per-side plate decomposition for the prescribed weight. Falls back to the
  // 'standard' plate set when settings haven't loaded — keeps the surface
  // render-safe before the query resolves (the bigweight readout itself
  // already renders under the same fallback in this file).
  const plateSet: PlateSet = settingsQuery.data?.plateSet ?? 'standard';
  const perSide = decompose(prescribedDisplay, plateSet).perSide;
  const existingPR = prsQuery.data?.find((p) => p.lift === lift);

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  const showSetSurface =
    live.phase === 'set' || live.phase === 'amrap-log' || live.phase === 'working-set-log';
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
    live.phase === 'working-set-log' ||
    live.phase === 'cancel-confirm'
  ) {
    if (live.isAmrap) {
      cta = (
        <PrimaryPillButton testID="cta-log-amrap" glyph="→" onPress={live.onOpenAmrapSheet}>
          Log AMRAP
        </PrimaryPillButton>
      );
    } else {
      // W1.3 split CTA — primary "Got all N ✓" + secondary "Log actual".
      // PrimaryPillButton already handles the light-impact haptic on its
      // own; the secondary outlined button fires a selection haptic to
      // signal "you're opening the sheet" rather than "you logged".
      cta = (
        <SplitWorkingSetCta
          prescribedReps={live.prescribedReps}
          onPrimary={live.onLogWorkingSet}
          onSecondary={() => {
            Haptics.selectionAsync();
            live.onOpenWorkingSetLogSheet();
          }}
        />
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
                ? displayWeight(live.lastLogged.estimated1RM, storageUnit, unit)
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

      <WorkingSetLogSheet
        open={live.phase === 'working-set-log'}
        lift={lift}
        prescribedWeight={prescribedDisplay}
        prescribedReps={live.prescribedReps}
        unit={unit}
        onCancel={live.onCancelWorkingSetLogSheet}
        onSave={live.onLogWorkingSetWithActual}
        testID="working-set-log-sheet"
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

/**
 * Two-button row replacing the single "Set complete" CTA for non-AMRAP
 * working sets (W1.3 split CTA, option b). Primary occupies flex 2 (the
 * happy path: all prescribed reps cleared); secondary occupies flex 1
 * (outlined, opens the actual-rep entry sheet).
 *
 * Both buttons sit inside the existing `CtaBar`; this component owns only
 * the horizontal layout + the two presses. The primary's light-impact
 * haptic is fired here directly so the visual + haptic shape matches the
 * canonical `PrimaryPillButton` path even though we don't use that
 * primitive (its 100%-width pill shape is incompatible with the split row).
 */
function SplitWorkingSetCta({
  prescribedReps,
  onPrimary,
  onSecondary,
}: {
  prescribedReps: number;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const { colors, spacing, radii } = useTheme();
  const row: ViewStyle = {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  };
  const primary: ViewStyle = {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: colors.ink0,
    borderRadius: radii.pill,
  };
  const secondary: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.bg0,
    borderWidth: 1,
    borderColor: colors.ink0,
    borderRadius: radii.pill,
  };
  return (
    <View style={row}>
      <Pressable
        testID="cta-log-working"
        accessibilityRole="button"
        accessibilityLabel={`Set complete, all ${prescribedReps} reps logged`}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPrimary();
        }}
        style={primary}
      >
        <Text
          variant="sans"
          weight="semibold"
          size={15}
          color="bg0"
          style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          Got all {prescribedReps}
        </Text>
        <Text variant="mono" weight="bold" size={13} color="bg0">
          ✓
        </Text>
      </Pressable>
      <Pressable
        testID="cta-log-working-actual"
        accessibilityRole="button"
        accessibilityLabel="Log actual reps, opens entry sheet"
        onPress={onSecondary}
        style={secondary}
      >
        <Text
          variant="sans"
          weight="semibold"
          size={13}
          color="ink0"
          style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          Log actual
        </Text>
      </Pressable>
    </View>
  );
}
