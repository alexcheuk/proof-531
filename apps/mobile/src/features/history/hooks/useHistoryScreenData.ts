/**
 * `useHistoryScreenData()` — composes the History screen's read surface.
 *
 * Centralizes the four TanStack Query reads (`useSessions`, `useSessionPrIds`,
 * `usePrs`, `useSettings`) and every derived shape the screen renders. Keeping
 * this together — instead of inlining seven `useMemo` calls in the screen body
 * — mirrors the pattern used by `useHomeScreenState`, `useLiveScreenState`,
 * and `useSettingsScreenData` and makes the derived shapes independently
 * testable.
 *
 * Accepts the active `HistoryFilter` so the hook can pre-compute the filtered
 * row list + cycle grouping. Filter state itself stays in the screen — it's
 * UI state, not derived data.
 */
import type { Session } from '@/data/accessors/session';
import { useLifetimeVolume } from '@/data/queries/useLifetimeVolume';
import { usePrs } from '@/data/queries/usePrs';
import { useSessionPrIds } from '@/data/queries/useSessionPrIds';
import { useSessions } from '@/data/queries/useSessions';
import { useSettings } from '@/data/queries/useSettings';
import type { Lift, Unit } from '@/domain/types';
import { type QueryLike, combineQueries } from '@/features/shared/QueryShell';
import { useCallback, useMemo } from 'react';
import { type HistoryStats, computeHistoryStats } from '../achievements';
import {
  currentStreakDays,
  daysSinceFirstSession,
  firstSessionDate,
  longestStreakDays,
  recentActivity,
  sessionsThisWeek,
} from '../activity';
import { type BestLift, pickBestLift } from '../bestLift';
import { type HistoryFilter, applyHistoryFilter } from '../filter';
import { type CycleGroup, groupByCycle } from '../grouping';

const DEFAULT_LIFTS: ReadonlyArray<Lift> = ['squat', 'bench', 'deadlift', 'press'];

export interface HistoryScreenData {
  /** All sessions, newest first. Defaults to `[]` while the query is pending. */
  rows: ReadonlyArray<Session>;
  /** Set of session ids that contain at least one PR set log. */
  prIds: ReadonlySet<number>;
  /** Lifts the user has enabled in Settings, or the default four. */
  enabledLifts: ReadonlyArray<Lift>;
  /** Lifetime totals — `filed` and `prs` counts across the FULL history. */
  stats: HistoryStats;
  /** 14-day activity bitmap, oldest first. */
  activity: boolean[];
  /** All-time longest consecutive-day streak. */
  longestStreak: number;
  /** Real-world current streak (walks back from today). */
  currentStreak: number;
  /** Date of the user's first completed session, or null. */
  trainingSince: Date | null;
  /** Inclusive day count from first session through today. */
  totalTrainingDays: number;
  /** Heaviest PR across all lifts, in the display unit. */
  bestLift: BestLift | null;
  /** Lifetime working-set volume across every completed session (storage unit). */
  lifetimeVolume: number;
  /** Unit the achievement strip should render its volume + glyphs in. */
  displayUnit: Unit;
  /** Sessions completed in the current ISO week (Mon-Sun). */
  sessionsThisWeek: number;
  /** Filter-applied rows. */
  filteredRows: Session[];
  /** Filtered rows grouped by cycle, first-seen order. */
  grouped: CycleGroup[];
  /** Combined loading/error state for `sessions` + `prIds`. */
  combined: QueryLike;
  /** Pull-to-refresh: refetches all four queries in parallel. */
  onRefresh: () => Promise<void>;
}

/**
 * Compose the History screen's data layer.
 *
 * Stats + activity always reflect the FULL history (lifetime totals, not the
 * filtered view) so the achievement strip stays anchored as the user explores
 * filters. Only `filteredRows`/`grouped` respond to the `filter` argument.
 */
export function useHistoryScreenData(filter: HistoryFilter): HistoryScreenData {
  const sessions = useSessions();
  const prIdsQuery = useSessionPrIds();
  const prsQuery = usePrs();
  const settingsQuery = useSettings();
  const lifetimeVolumeQuery = useLifetimeVolume();

  const onRefresh = useCallback(async () => {
    // Refetch every source the strip + list read from. Missing prsQuery or
    // settingsQuery here would leave the best-lift chip stale after a pull.
    await Promise.all([
      sessions.refetch(),
      prIdsQuery.refetch(),
      prsQuery.refetch(),
      settingsQuery.refetch(),
      lifetimeVolumeQuery.refetch(),
    ]);
  }, [sessions, prIdsQuery, prsQuery, settingsQuery, lifetimeVolumeQuery]);

  const rows = sessions.data ?? [];
  const prIds = prIdsQuery.data ?? new Set<number>();
  const enabledLifts = settingsQuery.data?.enabledLifts ?? DEFAULT_LIFTS;

  const stats = useMemo(() => computeHistoryStats(rows, prIds), [rows, prIds]);
  const activity = useMemo(() => recentActivity(rows), [rows]);
  const longestStreak = useMemo(() => longestStreakDays(rows), [rows]);
  const currentStreak = useMemo(() => currentStreakDays(rows), [rows]);
  const trainingSince = useMemo(() => firstSessionDate(rows), [rows]);
  const totalTrainingDays = useMemo(() => daysSinceFirstSession(rows), [rows]);
  const bestLift = useMemo(() => {
    const storageUnit = settingsQuery.data?.storageUnit ?? 'lbs';
    const displayUnit = settingsQuery.data?.displayUnit ?? storageUnit;
    return pickBestLift(prsQuery.data ?? [], storageUnit, displayUnit);
  }, [prsQuery.data, settingsQuery.data]);
  const filteredRows = useMemo(
    () => applyHistoryFilter(rows, filter, prIds),
    [rows, filter, prIds],
  );
  const grouped = useMemo(() => groupByCycle(filteredRows), [filteredRows]);
  const thisWeekCount = useMemo(() => sessionsThisWeek(rows), [rows]);

  const combined = combineQueries(sessions, prIdsQuery);
  const lifetimeVolume = lifetimeVolumeQuery.data ?? 0;
  const displayUnit: Unit =
    settingsQuery.data?.displayUnit ?? settingsQuery.data?.storageUnit ?? 'lbs';

  return {
    rows,
    prIds,
    enabledLifts,
    stats,
    activity,
    longestStreak,
    currentStreak,
    trainingSince,
    totalTrainingDays,
    bestLift,
    lifetimeVolume,
    displayUnit,
    sessionsThisWeek: thisWeekCount,
    filteredRows,
    grouped,
    combined,
    onRefresh,
  };
}
