import { usePrs } from '@/data/queries/usePrs';
import { useSession } from '@/data/queries/useSession';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { motion as motionTokens } from '@/design/tokens';
import { liftDisplayName } from '@/domain/labels';
import { decompose, plateLoadInstruction } from '@/domain/plates';
import type { Lift, PlateSet, Unit } from '@/domain/types';
import { convertWeight, displayUnit, displayWeight, round as snapWeight } from '@/domain/units';
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
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as KeepAwake from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useCallback, useEffect } from 'react';
import {
  Pressable,
  Text as RNText,
  ScrollView,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AmrapLogSheet } from './components/AmrapLogSheet';
import { BbbConfirmSurface } from './components/BbbConfirmSurface';
import { CancelConfirmSheet } from './components/CancelConfirmSheet';
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
  const { colors, spacing, type } = useTheme();
  const sessionQuery = useSession(sessionId);
  const prsQuery = usePrs();
  const settingsQuery = useSettings();
  const restSeconds = settingsQuery.data?.restTargetSeconds;
  const live = useLiveScreenState(sessionId, restSeconds !== undefined ? { restSeconds } : {});

  // Keep the screen awake for the entire session. Activate on mount,
  // deactivate on unmount. `activateKeepAwakeAsync` replaces the deprecated
  // sync `activateKeepAwake` (Expo SDK 51+); fire-and-forget here since
  // the activation is best-effort.
  useEffect(() => {
    void KeepAwake.activateKeepAwakeAsync();
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
    // Snapshot the destination at the moment we enter `complete` — a
    // cancelled session goes home (no celebration surface), a completed
    // one goes to the receipt. completeSession runs advanceDay (mutates
    // settings.week/cycle and, on wrap, the training_maxes history) and
    // AMRAP saves may have set a new PR, so we invalidate the broader
    // session-shaped surface alongside the three core keys. .catch
    // re-fires the same replace so the user is never stranded.
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
      queryClient.invalidateQueries({ queryKey: ['settings'] }),
      queryClient.invalidateQueries({ queryKey: ['trainingMaxes'] }),
      queryClient.invalidateQueries({ queryKey: ['prs'] }),
      queryClient.invalidateQueries({ queryKey: ['setLogsForSession', sessionId] }),
    ])
      .then(() => {
        // biome-ignore lint/suspicious/noExplicitAny: typedRoutes disabled
        router.replace(destination as any);
      })
      .catch((err) => {
        console.error('LiveScreen complete-flow invalidation failed', err);
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
  // W3.1 — capture both perSide and leftover so the feature-local caption
  // below the live TopSetBlock can render the "≈ prescribed (loaded N) {unit}
  // (M short)" copy. `decompose` returns leftover in the input unit (storage),
  // which we convert to display units before rendering. Threshold for showing
  // the caption is `> 0.1` storage units (above float-dust); the display-unit
  // round must also be non-zero.
  const decomposedLive = decompose(live.prescribedWeight, plateSet);
  const perSide = decomposedLive.perSide;
  const leftoverStorage = decomposedLive.leftover;
  const leftoverDisplayRaw = convertWeight(leftoverStorage, storageUnit, unit);
  const leftoverDisplayRounded = snapWeight(leftoverDisplayRaw, unit);
  const loadedDisplayRounded = snapWeight(prescribedDisplay - leftoverDisplayRounded, unit);
  const showLeftoverCaption = leftoverStorage > 0.1 && leftoverDisplayRounded > 0;
  const existingPR = prsQuery.data?.find((p) => p.lift === lift);

  // W2.4 — BBB plate decomposition (in storage units, then forwarded to the
  // BBB confirm surface in display currency). Same plateSet selection as the
  // main-work decomposition above.
  const bbbDisplayWeight = displayWeight(live.bbbPrescribedWeight, storageUnit, unit);
  const bbbPerSide = decompose(live.bbbPrescribedWeight, plateSet).perSide;

  // W2.1 — plate-load instruction for the NEXT SET band. Uses the just-
  // decomposed `perSide` (next set in storage units) and `lastLogged.weight`
  // (also storage units — captured in the hook at write time). Bar weight is
  // 45 lb / 20 kg keyed off the plate set.
  const barWeight = plateSet === 'kg-standard' ? 20 : 45;
  const lastLoadedStorage = live.lastLogged?.weight ?? 0;
  // During post-terminal rest the hook deliberately keeps `setIndex === 2` so
  // `onAdvanceFromRest` can fork into `bbb-confirm`. That means
  // `live.prescribedWeight` / `.pct` / `.prescribedReps` still describe the
  // just-completed top set, NOT the upcoming BBB. Spec W2.1 lines 330-332
  // require the NEXT SET band (and its plate-load instruction) to be
  // overridden with the BBB summary in that window so the lifter starts
  // stripping plates immediately. `bbbPerSide` is always lighter than the
  // top set's `perSide` in 5/3/1, which triggers the `unload to` branch of
  // `plateLoadInstruction`.
  const isPostTerminalRest = live.phase === 'rest' && live.postTerminalRest;
  const nextSetPerSide = isPostTerminalRest ? bbbPerSide : perSide;
  const plateInstruction = plateLoadInstruction(
    nextSetPerSide,
    barWeight,
    lastLoadedStorage,
    storageUnit,
  );

  // W2.1 — LOGGED band props. Convert `lastLogged.weight` (storage units) to
  // the display currency the user picked.
  const loggedWeightDisplay = live.lastLogged
    ? Math.round(convertWeight(live.lastLogged.weight, storageUnit, unit))
    : undefined;
  const loggedRepsDisplay = live.lastLogged?.reps;

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  // W3.1 — leftover caption style. Lives at the feature layer (not in the
  // shared `Text` primitive) because the `accessibilityRole` / `Label` shape
  // doesn't fit the primitive's typed props, and the line is feature-local
  // to Live anyway.
  const leftoverCaptionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink2,
    textAlign: 'center',
    marginTop: spacing.sm,
  };

  // W3-E — when the cancel sheet is open we render the surface the user was
  // on when they tapped the X (rest / bbb-confirm / set) underneath, so the
  // sheet doesn't visually leak the SET surface for someone who cancelled
  // mid-rest or mid-BBB. `live.phaseBeforeCancel` is captured by the hook at
  // sheet-open time.
  const underlyingPhase = live.phase === 'cancel-confirm' ? live.phaseBeforeCancel : live.phase;
  const showSetSurface =
    underlyingPhase === 'set' ||
    underlyingPhase === 'amrap-log' ||
    underlyingPhase === 'working-set-log';
  const showRestSurface = underlyingPhase === 'rest';
  const showBbbConfirmSurface = underlyingPhase === 'bbb-confirm';

  // W2.5 / W3.2 — cancel split branching at tap time. Today → Live is
  // `router.push` so the push history (home → today → live) would survive a
  // `router.back()` to a "Start session" CTA against a freshly-cancelled lift
  // — Branch A's `replace('/')` is the unambiguous exit.
  //
  //   Branch A — tap X with zero working/amrap rows logged: immediate cancel,
  //     no confirm sheet, selection haptic, replace-to-home.
  //   Branch B — tap X with ≥1 working/amrap row: opens the existing two-tap
  //     CancelConfirmSheet (will be slimmed in a future iteration to the
  //     single-tap "End this session?" variant per the spec; the current
  //     two-tap copy already covers the destructive intent).
  //   Branch C — long-press X (300ms) OR tap overflow `…`: always opens the
  //     two-tap destructive sheet, regardless of working count.
  //
  // W3.2 keeps the existing `CancelConfirmSheet` for B and C in this pass
  // (spec line 626: "Reuse CancelConfirmSheet"); the destructive copy
  // already conveys both branches' intent.
  const handleCancelRequest = useCallback(() => {
    if (live.loggedWorkingCount === 0) {
      Haptics.selectionAsync();
      void live.onImmediateCancel().then(() => {
        router.replace('/' as never);
      });
      return;
    }
    live.onRequestCancel();
  }, [live, router]);

  // W3.2 — Branch C entry point (long-press X or overflow tap). Always opens
  // the two-tap destructive sheet, regardless of working count.
  const handleLongPressCancel = useCallback(() => {
    live.onRequestCancel();
  }, [live]);

  // Primary CTA — depends on phase. The cancel-confirm and amrap-log phases
  // still render the underlying set/rest surface, so they re-use the same
  // CTA from the phase they popped out of (handled implicitly by
  // useLiveScreenState's phaseBeforeCancelRef).
  // CTA labels mirror the ref's `LiveScreen` logic exactly:
  //   ready phase, working set → "Set complete" (✓)
  //   ready phase, AMRAP set   → "Log AMRAP"   (→)
  //   rest phase, has next set → "Next set"    (→)
  //   rest phase, terminal     → "Complete session" (→) — actually a fork
  //                              into the BBB confirm phase (W2.4).
  //   bbb-confirm phase        → split CTA owned by BbbConfirmSurface itself
  //                              (no CtaBar pinned below).
  let cta: React.ReactElement | null = null;
  // Resolve the CTA against the underlying phase so opening the cancel sheet
  // from `rest` keeps the "Next set" pill underneath (W3-E), not a stale set
  // CTA. The cancel-sheet backdrop covers it visually either way; this just
  // keeps the model honest.
  if (underlyingPhase === 'rest') {
    // W2.4 — the terminal-set rest CTA reads "Complete session" because the
    // visible-user-facing transition is "you're done with main work"; the
    // BBB fork happens inside `onAdvanceFromRest` based on
    // `postTerminalRest`. For non-terminal rests, the label stays
    // "Next set" → next working set.
    const hasNext = live.setIndex < 2;
    // W3-B — breathing pulse at T-0. When `restRemaining === 0` the CTA
    // animates a continuous scale 1 → 1.04 → 1 (800ms each leg, ease-standard,
    // infinite reverse). The reduced-motion fallback inverts the CTA's
    // background/text colors statically (handled inside `BreathingNextSetCta`).
    cta = (
      <BreathingNextSetCta
        active={live.restRemaining <= 0}
        testID="cta-advance-rest"
        onPress={live.onAdvanceFromRest}
      >
        {hasNext ? 'Next set' : 'Complete session'}
      </BreathingNextSetCta>
    );
  } else if (underlyingPhase === 'bbb-confirm') {
    // BBB confirm phase renders its own split CTA inside the surface body —
    // intentionally no `CtaBar` here so the buttons sit flush with the
    // surface flow.
    cta = null;
  } else if (
    underlyingPhase === 'set' ||
    underlyingPhase === 'amrap-log' ||
    underlyingPhase === 'working-set-log'
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
        // W3.2 — cancel split visual: X chip + overflow `…` chip. The X chip
        // branches at tap time on `live.loggedWorkingCount` (Branch A =
        // immediate cancel, Branch B = single-tap confirm sheet); long-press
        // and overflow tap both open the existing two-tap destructive sheet
        // (Branch C). `handleCancelSplit` encapsulates the branching logic so
        // SessionTopBar stays a pure visual primitive.
        rightAction={{
          kind: 'cancel-split',
          onTapCancel: handleCancelRequest,
          onLongPressCancel: handleLongPressCancel,
          onTapOverflow: handleLongPressCancel,
        }}
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
            isPR={
              live.lastLogged?.isAmrap === true &&
              live.lastLogged.estimated1RM !== undefined &&
              live.lastLogged.estimated1RM > (existingPR?.bestE1RM ?? 0)
            }
            {...(loggedWeightDisplay !== undefined ? { loggedWeight: loggedWeightDisplay } : {})}
            {...(loggedRepsDisplay !== undefined ? { loggedReps: loggedRepsDisplay } : {})}
            remaining={live.restRemaining}
            target={live.restTarget}
            onSkipRest={live.onSkipRest}
            onAddRest={live.onAddRest}
            // During a non-terminal rest, useLiveScreenState has already
            // advanced setIndex to the next set, so live.prescribedWeight /
            // .pct / .isAmrap / .prescribedReps describe that next set. The
            // PlateBar perSide is computed off that same prescribed weight.
            // During post-terminal rest (W2.1 fixup) the hook deliberately
            // does NOT advance setIndex — instead it sets `postTerminalRest`
            // so `onAdvanceFromRest` can fork into `bbb-confirm`. In that
            // window we override the NEXT SET band with the BBB summary
            // (5 × 10 @ bbbWeight) per spec lines 330-332.
            nextSet={
              isPostTerminalRest
                ? {
                    weight: bbbDisplayWeight,
                    reps: 10,
                    amrap: false,
                    pct: 0.5,
                    perSide: bbbPerSide,
                    tmDisplay: Math.round(
                      convertWeight(session.trainingMaxSnapshot, storageUnit, unit),
                    ),
                  }
                : {
                    weight: prescribedDisplay,
                    reps: live.prescribedReps,
                    amrap: live.isAmrap,
                    pct: live.pct,
                    perSide,
                    tmDisplay: Math.round(
                      convertWeight(session.trainingMaxSnapshot, storageUnit, unit),
                    ),
                  }
            }
            plateInstruction={plateInstruction}
            testID="rest-phase"
          />
        ) : showBbbConfirmSurface ? (
          <BbbConfirmSurface
            bbbWeight={bbbDisplayWeight}
            unit={unit}
            perSide={bbbPerSide}
            onConfirm={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              void live.onConfirmBbb();
            }}
            onSkip={() => {
              Haptics.selectionAsync();
              void live.onSkipBbb();
            }}
            testID="bbb-confirm-surface"
          />
        ) : showSetSurface ? (
          <>
            <LiveHeader
              setIndex={live.setIndex}
              isAmrap={live.isAmrap}
              testID="live-header"
              lift={liftDisplayName(lift)}
            />

            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }} />

            <View style={{ paddingHorizontal: 24, paddingVertical: spacing.lg }}>
              <TopSetBlock
                eyebrow={`On the bar · ${Math.round(live.pct * 100)}% TM`}
                weight={prescribedDisplay}
                unitGlyph={displayUnit(unit)}
                reps={live.prescribedReps}
                amrap={live.isAmrap}
                perSide={perSide}
                plateVariant="full"
                bordered={false}
                testID="live-bigweight"
              />
              {/*
               * W3.1 — plate-leftover caption (relocated from the deleted
               * `LiveBigWeight.tsx`). Renders below the live `TopSetBlock`
               * only when the rounded leftover in display units is non-zero
               * AND the storage-units leftover exceeds 0.1 (above float
               * dust). Read-only — Today's hero `TopSetBlock` does NOT get
               * this caption because Today is a preview, not "what's on the
               * bar".
               */}
              {showLeftoverCaption ? (
                <RNText
                  accessibilityRole="text"
                  accessibilityLabel={`Prescribed ${prescribedDisplay} ${displayUnit(unit)}, loaded ${loadedDisplayRounded} ${displayUnit(unit)}, ${leftoverDisplayRounded} ${displayUnit(unit)} short`}
                  style={leftoverCaptionStyle}
                  testID="live-bigweight-leftover"
                >
                  {`≈ ${prescribedDisplay} ${displayUnit(unit)} — loaded ${loadedDisplayRounded} ${displayUnit(unit)} (${leftoverDisplayRounded} ${displayUnit(unit)} short)`}
                </RNText>
              ) : null}
            </View>

            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }} />
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

/**
 * Wave 3 W3-B — Breathing pulse on the rest-phase "Next set" CTA at T-0.
 *
 * Wraps `PrimaryPillButton` in an `Animated.View` that:
 *   - When `active === true` (restRemaining === 0): runs a continuous scale
 *     pulse 1 → 1.04 → 1 driven by `withRepeat(withTiming(1.04, ...), -1, true)`.
 *     Duration 800ms each leg, ease-standard cubic bezier.
 *   - When `active === false`: holds the scale at 1.
 *   - Reduced-motion fallback (`useReducedMotion()` true): no worklet ever
 *     starts. Instead, when `active` flips on, the CTA's background flips
 *     from `ink0` (default) to the same `ink0` with a subtle inset paper
 *     ring; per spec lines 426-428 the goal is to communicate "now" without
 *     motion. Implemented here by toggling `borderWidth` / `borderColor` —
 *     the PrimaryPillButton's `style` prop lets the wrapper add chrome
 *     without re-implementing the button shape.
 *
 * Cleanup: when `active` flips off (next rest cycle), the shared value
 * snaps back to 1 via a single 220ms `withTiming` so the pulse doesn't
 * appear to abruptly halt mid-breath.
 */
function BreathingNextSetCta({
  active,
  children,
  onPress,
  testID,
}: {
  active: boolean;
  children: ReactNode;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      return;
    }
    if (active) {
      scale.value = withRepeat(
        withTiming(1.04, {
          duration: 800,
          easing: Easing.bezier(...motionTokens.easeStandardBezier),
        }),
        -1,
        true,
      );
    } else {
      scale.value = withTiming(1, {
        duration: motionTokens.durationBase,
        easing: Easing.bezier(...motionTokens.easeStandardBezier),
      });
    }
  }, [active, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Reduced-motion fallback: when the CTA is "active" (T-0), add a 2pt paper
  // ring around the inside of the pill (using the `lineFaint` token so the
  // visual is the same e-ink hairline as the rest of the chrome). The static
  // rest state visibly differs from the "now" state without motion.
  const reducedMotionRing: ViewStyle | undefined =
    reduceMotion && active ? { borderWidth: 2, borderColor: colors.lineFaint } : undefined;

  return (
    <Animated.View testID={`${testID ?? 'cta-breathing'}-wrapper`} style={animatedStyle}>
      <PrimaryPillButton
        glyph="→"
        onPress={onPress}
        {...(testID !== undefined ? { testID } : {})}
        {...(reducedMotionRing ? { style: reducedMotionRing } : {})}
      >
        {children}
      </PrimaryPillButton>
    </Animated.View>
  );
}
