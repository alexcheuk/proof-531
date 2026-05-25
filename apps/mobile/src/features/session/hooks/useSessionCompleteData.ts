import { usePreviousBestE1RM } from '@/data/queries/usePreviousBestE1RM';
import { useSession } from '@/data/queries/useSession';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import { useSettings } from '@/data/queries/useSettings';
import { estimateOneRm } from '@/domain/epley';
import { formatDateLabel, formatElapsed, volumeOfWorkingSets } from '@/domain/summary';
import type { Lift, SetLog, Unit } from '@/domain/types';
import { convertWeight, displayUnit, displayWeight } from '@/domain/units';
import { useMemo } from 'react';

/**
 * Derives every view value SessionCompleteScreen needs from its three
 * queries (session row, set-logs, settings, prs).
 *
 * Pulling this out of the screen body keeps the rendering layer focused
 * on composition. Returns `null` for the data fields while still loading
 * so the screen can render its loading chrome without branching on every
 * individual query.
 */
export type SessionCompleteData = {
  ready: boolean;
  /** True while the underlying session row has not arrived. */
  loading: boolean;
  /** True if the session exists but is not yet `completed` (caller should bounce). */
  notCompleted: boolean;
  /** True if the session lookup returned null (caller should bounce home). */
  missing: boolean;
  view: SessionCompleteView | null;
};

export type SessionCompleteView = {
  session: NonNullable<ReturnType<typeof useSession>['data']>;
  lift: Lift;
  liftLower: string;
  storageUnit: Unit;
  renderUnit: Unit;
  unitGlyph: 'lb' | 'kg';
  // Title block
  completedThisCycle: number;
  sessionsInCycle: number;
  eyebrowDate: string;
  stampParts: ReturnType<typeof formatDateLabel>;
  /** True when this session is the terminal session of its cycle (completedThisCycle === sessionsInCycle). */
  isCycleComplete: boolean;
  // PR / certificate
  hasPR: boolean;
  showCertificate: boolean;
  e1RMDisplay: number;
  prevE1RMDisplay: number;
  e1RMDelta: number;
  // Receipt
  topWeight: number;
  topReps: number;
  topIsAmrap: boolean;
  workingVolume: number;
  elapsedReady: boolean;
  elapsedValue: string;
  // BBB summary — present (number > 0 + display weight > 0) when the
  // user marked BBB complete via the prompt screen, absent otherwise.
  // The skip path on BbbPromptScreen writes no rows, so an empty BBB
  // remains a real distinction on the receipt.
  bbbSetsCompleted: number;
  bbbWeightDisplay: number;
};

export function useSessionCompleteData(sessionId: number): SessionCompleteData {
  const sessionQuery = useSession(sessionId);
  const setLogsQuery = useSetLogsForSession(sessionId);
  const settingsQuery = useSettings();
  const session = sessionQuery.data;
  const liftForQuery = session ? (session.lift as Lift) : null;
  // `prs` alone reports the CURRENT best — and `appendSetLog` has already
  // upserted it to this session's e1RM by the time we mount. Query the
  // prior best directly (max estimated1RM across other completed-session
  // AMRAP rows for the same lift) so the certificate can show a real delta.
  const prevBestQuery = usePreviousBestE1RM(liftForQuery, session?.id ?? null);

  const setLogsData = setLogsQuery.data;
  const settingsData = settingsQuery.data;
  const prevBestStorage = prevBestQuery.data ?? 0;

  const view = useMemo<SessionCompleteView | null>(() => {
    if (!session) return null;
    if (session.status !== 'completed') return null;
    return deriveView({ session, setLogsData, settingsData, prevBestStorage });
  }, [session, setLogsData, settingsData, prevBestStorage]);

  return {
    ready: !!view,
    loading: sessionQuery.isLoading,
    missing: sessionQuery.data === null,
    notCompleted: !!session && session.status !== 'completed',
    view,
  };
}

export function deriveView({
  session,
  setLogsData,
  settingsData,
  prevBestStorage,
}: {
  session: NonNullable<ReturnType<typeof useSession>['data']>;
  setLogsData: ReturnType<typeof useSetLogsForSession>['data'];
  settingsData: ReturnType<typeof useSettings>['data'];
  /** Best e1RM (storage unit) for this lift before this session was logged. */
  prevBestStorage: number;
}): SessionCompleteView {
  const lift = session.lift as Lift;
  const storageUnit: Unit = session.storageUnitSnapshot ?? 'lbs';
  const renderUnit: Unit = session.displayUnitSnapshot ?? storageUnit;
  const unitGlyph = displayUnit(renderUnit);
  const liftLower = lift === 'deadlift' ? 'deadlift' : lift;

  const rawLogs = setLogsData ?? [];
  const logs: SetLog[] = rawLogs.map((l) => ({
    id: l.id,
    sessionId: l.sessionId,
    index: l.index,
    kind: l.kind,
    prescribedWeight: l.prescribedWeight,
    prescribedReps: l.prescribedReps,
    actualReps: l.actualReps,
    completedAt: l.completedAt,
    isPR: l.isPR ?? false,
    ...(l.estimated1RM != null ? { estimated1RM: l.estimated1RM } : {}),
  }));
  const workingLogs = logs.filter((l) => l.kind === 'working' || l.kind === 'amrap');
  const hasPR = workingLogs.some((l) => l.isPR === true);

  // Date stamp parts — `endedAt` is set on the happy path.
  const stampTs = session.endedAt ?? null;
  const stampDate = stampTs ? new Date(stampTs) : null;
  const stampParts = stampDate
    ? formatDateLabel(stampDate)
    : { weekday: 'TODAY', dateLine: '', year: String(new Date().getFullYear()) };
  const eyebrowDate = stampDate
    ? `${stampParts.weekday[0]}${stampParts.weekday.slice(1).toLowerCase()} · ${
        stampParts.dateLine[0]
      }${stampParts.dateLine.slice(1).toLowerCase()}`
    : 'Today';

  // e1RM — derived from the AMRAP log when present; otherwise the heaviest
  // Epley estimate across working sets. Round once for display.
  const amrapLog = workingLogs.find((l) => l.kind === 'amrap');
  const newE1RMStorage =
    amrapLog && amrapLog.estimated1RM !== undefined
      ? amrapLog.estimated1RM
      : workingLogs.reduce((max, l) => {
          const v = estimateOneRm(l.prescribedWeight, l.actualReps);
          return v > max ? v : max;
        }, 0);
  const e1RMDisplay = Math.round(convertWeight(newE1RMStorage, storageUnit, renderUnit));
  const showCertificate = hasPR && e1RMDisplay > 0;

  // Elapsed time.
  const endedAtNum = typeof session.endedAt === 'number' ? session.endedAt : null;
  const elapsedReady =
    typeof session.startedAt === 'number' && endedAtNum !== null && endedAtNum > session.startedAt;
  const elapsedValue =
    elapsedReady && endedAtNum !== null ? formatElapsed(session.startedAt, endedAtNum) : '';

  // Top working set drives the receipt's first row.
  const topSet = workingLogs.find((l) => l.index === 2);
  const topWeightStorage = topSet?.prescribedWeight ?? 0;
  const topWeight = displayWeight(topWeightStorage, storageUnit, renderUnit);
  const topReps = topSet?.actualReps ?? 0;
  const topIsAmrap = topSet?.kind === 'amrap';

  // Volume.
  const workingVolumeStorage = volumeOfWorkingSets(workingLogs);
  const workingVolume = Math.round(convertWeight(workingVolumeStorage, storageUnit, renderUnit));

  // BBB rollup — the prompt screen writes 5 `kind: 'bbb'` rows on
  // "Mark complete" (loop-008). Each row carries the same
  // prescribedWeight (50% TM in storage units); the first row's weight
  // is the canonical BBB weight for this session.
  const bbbLogs = logs.filter((l) => l.kind === 'bbb');
  const bbbSetsCompleted = bbbLogs.length;
  const bbbWeightStorageRow = bbbLogs[0]?.prescribedWeight ?? 0;
  const bbbWeightDisplay = Math.round(
    convertWeight(bbbWeightStorageRow, storageUnit, renderUnit),
  );

  // Cycle position math — falls back to 4-lift defaults if settings haven't
  // loaded. Single resolved `liftsPerCycle` so the position math and the
  // grid ceiling cannot disagree.
  const enabledLifts = settingsData?.enabledLifts ?? ['squat', 'bench', 'deadlift', 'press'];
  const liftsPerCycle = enabledLifts.length || 4;
  const sessionsInCycle = liftsPerCycle * 4;
  const indexInWeek = enabledLifts.indexOf(lift);
  // Disabled-after-the-fact lift: place at the END of the week so the grid
  // still highlights some cell within the correct week range.
  const liftPos = indexInWeek === -1 ? liftsPerCycle - 1 : indexInWeek;
  const completedThisCycle = Math.min(
    sessionsInCycle,
    Math.max(1, (session.week - 1) * liftsPerCycle + (liftPos + 1)),
  );
  const isCycleComplete = completedThisCycle === sessionsInCycle;

  // PR baseline: best e1RM observed in OTHER completed sessions for this
  // lift (the `prs` row has already been overwritten with THIS session's
  // new best by the time we mount, so we can't read it from there).
  // Convert with same precision policy as the new e1RM so the cert's delta
  // arithmetic stays internally consistent.
  const prevE1RMDisplay = prevBestStorage
    ? Math.round(convertWeight(prevBestStorage, storageUnit, renderUnit))
    : 0;
  const e1RMDelta = Math.max(0, e1RMDisplay - prevE1RMDisplay);

  return {
    session,
    lift,
    liftLower,
    storageUnit,
    renderUnit,
    unitGlyph,
    completedThisCycle,
    sessionsInCycle,
    isCycleComplete,
    eyebrowDate,
    stampParts,
    hasPR,
    showCertificate,
    e1RMDisplay,
    prevE1RMDisplay,
    e1RMDelta,
    topWeight,
    topReps,
    topIsAmrap,
    workingVolume,
    elapsedReady,
    elapsedValue,
    bbbSetsCompleted,
    bbbWeightDisplay,
  };
}
