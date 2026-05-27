import type { LiftGoalKind } from '@/data/accessors/liftGoal';
import type { LiftProgression } from '@/data/queries/useLiftProgression';
import { ProgressGridCell } from '@/design/primitives/ProgressGridCell';
import { ProgressGridRow } from '@/design/primitives/ProgressGridRow';
import { TmCell } from '@/design/primitives/TmCell';
import { tmAdjustmentSuggestion } from '@/domain/progression';
import type { Lift } from '@/domain/types';
import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GoalRuleRow } from './GoalRuleRow';

type ProgressLiftRowProps = {
  /** Lift owning this row — needed to band-classify TM-test cells. */
  lift: Lift;
  /** Display unit — passed to `tmAdjustmentSuggestion` for TM-test cells. */
  unit: 'lbs' | 'kg';
  row: LiftProgression['rows'][number];
  unitGlyph: 'lb' | 'kg';
  onPastCellPress: (sessionId: number) => void;
  goalCycle: number | null;
  draftKind: LiftGoalKind;
  draftValue: number;
  draftTargetTm: number;
  /**
   * When true, plays a one-time fill-in animation on the row's `last-done`
   * cell (opacity 0 → 1 + scale 0.85 → 1) and a brief delayed pulse on the
   * `now` cell (Discord 1508779267 — arriving from a just-completed
   * session). False on every subsequent visit to Progress.
   */
  playLastDoneAnimation?: boolean;
};

const FILL_IN_DURATION_MS = 480;
const PULSE_DELAY_MS = FILL_IN_DURATION_MS - 80;
const PULSE_UP_MS = 220;
const PULSE_DOWN_MS = 260;
const PULSE_SCALE = 1.12;

function useFillInStyle(active: boolean) {
  // Always start at full opacity/scale. When `active` flips to true, snap
  // to the "from" state first (0, 0.85) then animate to (1, 1). Without
  // the explicit snap, the shared values stay at 1 (their initial value
  // while active=false) and the withTiming call is a 1→1 no-op — making
  // the animation invisible.
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!active) {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      opacity.value = 1;
      scale.value = 1;
      return;
    }
    opacity.value = 0;
    scale.value = 0.85;
    opacity.value = withTiming(1, {
      duration: FILL_IN_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: FILL_IN_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(scale);
    };
  }, [active, opacity, scale]);
  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
}

function usePulseStyle(active: boolean) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!active) {
      scale.value = 1;
      return;
    }
    scale.value = withDelay(
      PULSE_DELAY_MS,
      withSequence(
        withTiming(PULSE_SCALE, {
          duration: PULSE_UP_MS,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1, {
          duration: PULSE_DOWN_MS,
          easing: Easing.inOut(Easing.cubic),
        }),
      ),
    );
    return () => {
      cancelAnimation(scale);
    };
  }, [active, scale]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

/**
 * One row of the Progress cycle matrix — four day cells + the cycle's TM,
 * with a dashed `GoalRuleRow` above when this cycle is the one whose
 * projected TM first reaches the user's goal.
 *
 * Distinct name from the design-system `Row` primitive: this is a
 * *grid* row composed of grid cells, not a generic flex row.
 */
export function ProgressLiftRow({
  lift,
  unit,
  row,
  unitGlyph,
  onPastCellPress,
  goalCycle,
  draftKind,
  draftValue,
  draftTargetTm,
  playLastDoneAnimation = false,
}: ProgressLiftRowProps) {
  const placeRuleAbove = goalCycle === row.cycle;
  // Animated styles are hooks — must run unconditionally for every render.
  // They no-op (return identity transforms) when the row doesn't actually
  // hold a last-done or now cell.
  const fillInStyle = useFillInStyle(playLastDoneAnimation);
  const pulseStyle = usePulseStyle(playLastDoneAnimation);
  return (
    <>
      {placeRuleAbove ? (
        <GoalRuleRow
          kind={draftKind}
          value={draftValue}
          targetTm={draftTargetTm}
          unitGlyph={unitGlyph}
          testID={`progress-goal-rule-${row.cycle}`}
        />
      ) : null}
      <ProgressGridRow
        cycle={row.cycle}
        state={row.isCurrent ? 'current' : row.isPast ? 'past' : 'future'}
        testID={`progress-row-${row.cycle}`}
      >
        {row.cells.map((cell) => {
          if (cell.kind === 'now') {
            const nowCell = (
              <ProgressGridCell
                key={`cell-${row.cycle}-${cell.day}`}
                variant="now"
                weight={cell.prescribedWeight}
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: next, prescribed ${cell.prescribedWeight} ${unitGlyph}`}
                testID={`progress-cell-${row.cycle}-${cell.day}`}
              />
            );
            return playLastDoneAnimation ? (
              <Animated.View
                key={`cell-${row.cycle}-${cell.day}`}
                style={[{ flex: 1 }, pulseStyle]}
              >
                {nowCell}
              </Animated.View>
            ) : (
              nowCell
            );
          }
          if (cell.kind === 'future') {
            return (
              <ProgressGridCell
                key={`cell-${row.cycle}-${cell.day}`}
                variant="future"
                weight={cell.projectedWeight}
                marker={cell.deload ? '─' : null}
                accessibilityLabel={`Cycle ${row.cycle}, day ${cell.day}: projected ${cell.projectedWeight} ${unitGlyph}`}
                testID={`progress-cell-${row.cycle}-${cell.day}`}
              />
            );
          }
          const variant = cell.kind === 'last-done' ? 'outlined' : 'past';
          // Marker derivation. Three cases on the deload column:
          //   1. TM-test session → band glyph (↑ / = / ↓) from rep count.
          //   2. Legacy 'working' deload (pre-migration) → existing ✓.
          //   3. Non-deload day → no marker (rep count or weight only).
          const tmTestBand =
            cell.topSetKind === 'tm-test' ? tmAdjustmentSuggestion(cell.topReps, lift, unit) : null;
          const marker: '✓' | '↑' | '↓' | '=' | '─' | null = tmTestBand
            ? tmTestBand.kind === 'increment'
              ? '↑'
              : tmTestBand.kind === 'hold'
                ? '='
                : '↓'
            : cell.deload
              ? '✓'
              : null;
          const a11yPrefix = cell.kind === 'last-done' ? 'Most recent. ' : '';
          const a11ySuffix = cell.amrap
            ? ` for ${cell.topReps} reps`
            : tmTestBand
              ? `, TM test ${cell.topReps} reps, suggests ${tmTestBand.kind}`
              : cell.deload
                ? ' deload logged'
                : '';
          const pastCell = (
            <ProgressGridCell
              key={`cell-${row.cycle}-${cell.day}`}
              variant={variant}
              weight={cell.topWeight}
              reps={cell.amrap ? cell.topReps : null}
              marker={marker}
              onPress={() => onPastCellPress(cell.sessionId)}
              accessibilityLabel={`${a11yPrefix}Cycle ${row.cycle}, day ${cell.day}: top set ${cell.topWeight} ${unitGlyph}${a11ySuffix}`}
              testID={`progress-cell-${row.cycle}-${cell.day}`}
            />
          );
          if (cell.kind === 'last-done' && playLastDoneAnimation) {
            return (
              <Animated.View
                key={`cell-${row.cycle}-${cell.day}`}
                style={[{ flex: 1 }, fillInStyle]}
              >
                {pastCell}
              </Animated.View>
            );
          }
          return pastCell;
        })}
        <TmCell
          tm={row.tm}
          variant={row.isCurrent ? 'current' : row.isPast ? 'past' : 'future'}
          accessibilityLabel={`Cycle ${row.cycle} training max ${row.tm} ${unitGlyph}`}
          testID={`progress-tm-${row.cycle}`}
        />
      </ProgressGridRow>
    </>
  );
}
