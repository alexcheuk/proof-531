import { usePrs } from '@/data/queries/usePrs';
import { useSession } from '@/data/queries/useSession';
import { useSettings } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { CtaBar } from '@/design/primitives/CtaBar';
import { CtaBarReserve } from '@/design/primitives/CtaBarReserve';
import { StatusBarShim } from '@/design/primitives/StatusBarShim';
import { ThemeProvider, useTheme } from '@/design/theme';
import { colors as baseColors } from '@/design/tokens';
import { liftDisplayName } from '@/domain/labels';
import { decompose, defaultPlateSet } from '@/domain/plates';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convert, displayWeight } from '@/domain/units';
import { goTo } from '@/lib/routes';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { AmrapLogSheet } from './components/AmrapLogSheet';
import { LiveCtaButton } from './components/LiveCtaButton';
import { RestPhase } from './components/RestPhase';
import { SessionLayout } from './components/SessionLayout';
import { SessionTopBar } from './components/SessionTopBar';
import { SetPhase } from './components/SetPhase';
import { TmTestLogSheet } from './components/TmTestLogSheet';
import { useElapsedSeconds } from './hooks/useElapsedSeconds';
import { useHardwareBack } from './hooks/useHardwareBack';
import { useLiveScreenEffects } from './hooks/useLiveScreenEffects';
import { useLiveScreenState } from './hooks/useLiveScreenState';
import { useRestNotification } from './hooks/useRestNotification';
import { derivePlateChangeHint } from './livePlateHint';

export type LiveScreenProps = {
  sessionId: number;
};

export function LiveScreen({ sessionId }: LiveScreenProps) {
  const settingsQuery = useSettings();
  const inverted = settingsQuery.data?.liveScreenInverted ?? false;
  return (
    <ThemeProvider invert={inverted}>
      <LiveScreenBody sessionId={sessionId} inverted={inverted} />
    </ThemeProvider>
  );
}

type LiveScreenBodyProps = LiveScreenProps & { inverted: boolean };

function LiveScreenBody({ sessionId, inverted }: LiveScreenBodyProps) {
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

  // Schedule a "rest complete" local notification when rest starts so
  // users get alerted even if they navigate away during rest.
  useRestNotification({
    active: live.phase === 'rest',
    restSeconds: settingsQuery.data?.restTargetSeconds ?? 90,
    sessionId,
    getDeadlineMs: live.getRestDeadlineMs,
    setDeadline: live.syncRestDeadline,
  });

  const elapsedSeconds = useElapsedSeconds(sessionQuery.data?.startedAt ?? null);

  // Hardware back on Live should land on the day's plan (Today), not the
  // tab the user originated from. Mirrors the visible back chip.
  const liftForBack = sessionQuery.data?.lift as Lift | undefined;
  useHardwareBack({
    enabled: live.phase === 'set' || live.phase === 'rest',
    onBack: () => {
      if (liftForBack) goTo.today(router, liftForBack, { replace: true });
      else goTo.home(router);
    },
  });

  if (!sessionQuery.data) {
    return (
      <SessionLayout testID="live-loading">
        <LiveStatusBar inverted={inverted} />
        <SessionTopBar onBack={() => goTo.home(router)} backLabel="Back to plan" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <CapsLabel size="md" color="ink3">
            LOADING SESSION…
          </CapsLabel>
        </View>
      </SessionLayout>
    );
  }

  const session = sessionQuery.data;
  const lift = session.lift as Lift;
  const storageUnit: Unit = session.storageUnitSnapshot ?? 'lbs';
  // Display unit uses the session snapshot so mid-session settings changes don't affect this render.
  const unit: Unit = session.displayUnitSnapshot ?? storageUnit;
  // Convert from storage unit; identity when they match, corrects post-migration in-flight sessions.
  const prescribedDisplay = displayWeight(live.prescribedWeight, storageUnit, unit);
  // Decompose against storage unit so plate selection is physically correct (lb plates on lb TM).
  const plateSet: PlateSet = settingsQuery.data?.plateSet ?? defaultPlateSet(storageUnit);
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

  // Set surface is visible during 'set', 'amrap-log', and 'tm-test-log'.
  const showSetSurface =
    live.phase === 'set' || live.phase === 'amrap-log' || live.phase === 'tm-test-log';
  const showRestSurface = live.phase === 'rest';

  return (
    <SessionLayout>
      <LiveStatusBar inverted={inverted} />
      <SessionTopBar
        onBack={() => goTo.today(router, lift, { replace: true })}
        backLabel="Back to plan"
        // Live surfaces only the contextual recovery action: Undo last
        // set during rest. Restart lives on the Today screen.
        {...(live.phase === 'rest' && live.lastLogged && !live.lastLogged.isAmrap
          ? { onUndo: live.onUndoLastSet }
          : {})}
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
            remaining={live.restRemaining}
            onAddRest={live.onAddRest}
            onSubRest={live.onSubRest}
            onSkip={live.onAdvanceFromRest}
            // setIndex advanced past rest — prescribedWeight already describes the NEXT set.
            nextSet={{
              weight: prescribedDisplay,
              reps: live.prescribedReps,
              amrap: live.isAmrap,
              pct: live.pct,
              perSide,
              tmDisplay: convert(session.trainingMaxSnapshot, storageUnit, unit),
            }}
            testID="rest-phase"
          />
        ) : showSetSurface ? (
          <SetPhase
            setIndex={live.setIndex}
            isAmrap={live.isAmrap}
            isTmTest={live.isTmTest}
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
          isTmTest={live.isTmTest}
          onAdvanceFromRest={live.onAdvanceFromRest}
          onOpenAmrapSheet={live.onOpenAmrapSheet}
          onOpenTmTestSheet={live.onOpenTmTestSheet}
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

      <TmTestLogSheet
        open={live.phase === 'tm-test-log'}
        lift={lift}
        tm={prescribedDisplay}
        unit={unit}
        onCancel={live.onCancelTmTestSheet}
        onSave={live.onSaveTmTest}
        testID="tm-test-sheet"
      />
    </SessionLayout>
  );
}

function LiveStatusBar({ inverted }: { inverted: boolean }) {
  // Use base palette directly — the inverted ThemeProvider would swap ink0↔bg0 before this reaches the tint store.
  if (inverted) return <StatusBarShim color={baseColors.ink0} style="light" />;
  return <StatusBar style="dark" />;
}
