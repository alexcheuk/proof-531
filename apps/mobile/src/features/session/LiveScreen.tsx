import { usePrs } from '@/data/queries/usePrs';
import { useSession } from '@/data/queries/useSession';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { CtaBarReserve } from '@/design/primitives/CtaBarReserve';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import { decompose } from '@/domain/plates';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convertWeight, displayWeight } from '@/domain/units';
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
import { ScrollView, type ViewStyle } from 'react-native';
import { AmrapLogSheet } from './components/AmrapLogSheet';
import { CancelConfirmSheet } from './components/CancelConfirmSheet';
import { LiveCtaButton } from './components/LiveCtaButton';
import { RestPhase } from './components/RestPhase';
import { SessionLayout } from './components/SessionLayout';
import { SessionTopBar } from './components/SessionTopBar';
import { SetPhase } from './components/SetPhase';
import { useElapsedSeconds } from './hooks/useElapsedSeconds';
import { useLiveScreenEffects } from './hooks/useLiveScreenEffects';
import { useLiveScreenState } from './hooks/useLiveScreenState';
import { derivePlateChangeHint } from './livePlateHint';

export type LiveScreenProps = {
  sessionId: number;
};

export function LiveScreen({ sessionId }: LiveScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const sessionQuery = useSession(sessionId);
  const prsQuery = usePrs();
  const settingsQuery = useSettings();
  const restSeconds = settingsQuery.data?.restTargetSeconds;
  const live = useLiveScreenState(sessionId, restSeconds !== undefined ? { restSeconds } : {});
  const sessionStatus = sessionQuery.data?.status;

  useLiveScreenEffects({
    sessionId,
    phase: live.phase,
    sessionStatus,
    sessionLoading: sessionQuery.isLoading,
    sessionMissing: sessionQuery.data === null,
  });

  const elapsedSeconds = useElapsedSeconds(sessionQuery.data?.startedAt ?? null);

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

  const plateChangeHint = derivePlateChangeHint({
    week: session.week as Week,
    setIndex: live.setIndex,
    trainingMaxSnapshot: session.trainingMaxSnapshot,
    storageUnit,
    prescribedWeight: live.prescribedWeight,
  });

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  // The set surface stays mounted while the cancel-confirm sheet is open
  // so the working-set UI is visible behind the destructive sheet. Folding
  // 'cancel-confirm' into the same predicate keeps the render branch
  // honest if a future phase is added — the existing dual condition was
  // fragile (update one site, forget the other).
  const showSetSurface =
    live.phase === 'set' || live.phase === 'amrap-log' || live.phase === 'cancel-confirm';
  const showRestSurface = live.phase === 'rest';

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
            loggedUnit={unit}
            isAmrap={live.lastLogged?.isAmrap ?? false}
            estimated1RM={
              live.lastLogged?.estimated1RM !== undefined
                ? Math.round(convertWeight(live.lastLogged.estimated1RM, storageUnit, unit))
                : undefined
            }
            remaining={live.restRemaining}
            target={live.restTarget}
            onAddRest={live.onAddRest}
            onSubRest={live.onSubRest}
            onSkip={live.onAdvanceFromRest}
            // During rest, useLiveScreenState has already advanced setIndex
            // to the next set, so live.prescribedWeight / .pct / .isAmrap /
            // .prescribedReps describe that set. The PlateBar perSide is
            // already computed off the same prescribed weight above.
            nextSet={{
              weight: prescribedDisplay,
              reps: live.prescribedReps,
              amrap: live.isAmrap,
              pct: live.pct,
              perSide,
              tmDisplay: Math.round(convertWeight(session.trainingMaxSnapshot, storageUnit, unit)),
            }}
            testID="rest-phase"
          />
        ) : showSetSurface ? (
          <SetPhase
            setIndex={live.setIndex}
            isAmrap={live.isAmrap}
            liftLabel={liftDisplayName(lift)}
            elapsedSeconds={elapsedSeconds}
            weight={prescribedDisplay}
            reps={live.prescribedReps}
            pct={live.pct}
            unit={unit}
            perSide={perSide}
            {...(plateChangeHint ? { plateChangeHint } : {})}
          />
        ) : null}
        <CtaBarReserve />
      </ScrollView>
      <CtaBar>
        <LiveCtaButton
          phase={live.phase}
          setIndex={live.setIndex}
          isAmrap={live.isAmrap}
          onAdvanceFromRest={live.onAdvanceFromRest}
          onOpenAmrapSheet={live.onOpenAmrapSheet}
          onLogWorkingSet={live.onLogWorkingSet}
        />
      </CtaBar>

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
