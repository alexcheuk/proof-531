/**
 * Behavior tests for `useHistoryScreenData`.
 *
 * Mocks the four TanStack Query hooks at module-load so the hook can be driven
 * synchronously via `renderHook`. Asserts the derived shapes (`stats`,
 * `activity`, `currentStreak`, `grouped`) and that `onRefresh` invokes every
 * query's `refetch` exactly once.
 *
 * Stub variables are prefixed `mock*` so Jest allows them inside `jest.mock`
 * factories (which run before any non-`mock`-prefixed top-level bindings).
 */
import type { Session } from '@/data/accessors/session';
import type { HistoryFilter } from '@/features/history/filter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

type QueryStub<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: jest.Mock<Promise<{ data: T | undefined }>, []>;
};

function makeStub<T>(data: T | undefined): QueryStub<T> {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn().mockResolvedValue({ data }),
  };
}

const mockSessionsStub: QueryStub<Session[]> = makeStub<Session[]>([]);
const mockPrIdsStub: QueryStub<Set<number>> = makeStub<Set<number>>(new Set());
const mockPrsStub: QueryStub<unknown[]> = makeStub<unknown[]>([]);
const mockSettingsStub: QueryStub<{
  storageUnit: 'lbs' | 'kg';
  displayUnit: 'lbs' | 'kg';
  enabledLifts: Array<'squat' | 'bench' | 'deadlift' | 'press'>;
}> = makeStub({
  storageUnit: 'lbs',
  displayUnit: 'lbs',
  enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
});
const mockLifetimeVolumeStub: QueryStub<number> = makeStub<number>(0);

jest.mock('@/data/queries/useSessions', () => ({
  useSessions: () => mockSessionsStub,
}));
jest.mock('@/data/queries/useSessionPrIds', () => ({
  useSessionPrIds: () => mockPrIdsStub,
}));
jest.mock('@/data/queries/usePrs', () => ({
  usePrs: () => mockPrsStub,
}));
jest.mock('@/data/queries/useSettings', () => ({
  useSettings: () => mockSettingsStub,
}));
jest.mock('@/data/queries/useLifetimeVolume', () => ({
  useLifetimeVolume: () => mockLifetimeVolumeStub,
}));

import { useHistoryScreenData } from '../useHistoryScreenData';

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function resetStubs() {
  mockSessionsStub.data = [];
  mockSessionsStub.refetch = jest.fn().mockResolvedValue({ data: [] });
  mockPrIdsStub.data = new Set();
  mockPrIdsStub.refetch = jest.fn().mockResolvedValue({ data: new Set() });
  mockPrsStub.data = [];
  mockPrsStub.refetch = jest.fn().mockResolvedValue({ data: [] });
  mockSettingsStub.data = {
    storageUnit: 'lbs',
    displayUnit: 'lbs',
    enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
  };
  mockSettingsStub.refetch = jest.fn().mockResolvedValue({ data: mockSettingsStub.data });
  mockLifetimeVolumeStub.data = 0;
  mockLifetimeVolumeStub.refetch = jest.fn().mockResolvedValue({ data: 0 });
}

const ALL_FILTER: HistoryFilter = { kind: 'all' };

/** Build a minimal Session row  -  only the fields the derived helpers read. */
function mkSession(over: Partial<Session> & { id: number; startedAt: number }): Session {
  return {
    id: over.id,
    lift: over.lift ?? 'squat',
    week: over.week ?? 1,
    cycle: over.cycle ?? 1,
    trainingMaxSnapshot: over.trainingMaxSnapshot ?? 200,
    storageUnitSnapshot: over.storageUnitSnapshot ?? 'lbs',
    displayUnitSnapshot: over.displayUnitSnapshot ?? 'lbs',
    startedAt: over.startedAt,
    endedAt: over.endedAt ?? null,
    status: over.status ?? 'completed',
  } as unknown as Session;
}

describe('useHistoryScreenData', () => {
  beforeEach(() => {
    resetStubs();
  });

  it('returns defaults when sessions list is empty', () => {
    const { result } = renderHook(() => useHistoryScreenData(ALL_FILTER), { wrapper });

    expect(result.current.rows).toEqual([]);
    expect(result.current.prIds.size).toBe(0);
    expect(result.current.enabledLifts).toEqual(['squat', 'bench', 'deadlift', 'press']);
    expect(result.current.stats).toEqual({ filed: 0, prs: 0 });
    expect(result.current.activity).toHaveLength(14);
    expect(result.current.activity.every((d) => d === false)).toBe(true);
    expect(result.current.longestStreak).toBe(0);
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.trainingSince).toBeNull();
    expect(result.current.totalTrainingDays).toBe(0);
    expect(result.current.bestLift).toBeNull();
    expect(result.current.filteredRows).toEqual([]);
    expect(result.current.grouped).toEqual([]);
  });

  it('computes stats/streak/activity/grouped from a filled session list', () => {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    // Two completed sessions on consecutive days (today + yesterday), same cycle.
    const today = mkSession({ id: 1, startedAt: now, cycle: 2 });
    const yesterday = mkSession({ id: 2, startedAt: now - DAY_MS, cycle: 2 });
    const earlier = mkSession({ id: 3, startedAt: now - 10 * DAY_MS, cycle: 1 });
    mockSessionsStub.data = [today, yesterday, earlier];
    mockPrIdsStub.data = new Set([1]); // session 1 produced a PR

    const { result } = renderHook(() => useHistoryScreenData(ALL_FILTER), { wrapper });

    expect(result.current.stats.filed).toBe(3);
    expect(result.current.stats.prs).toBe(1);
    // Activity bitmap is oldest → newest, length 14, with today on the right.
    expect(result.current.activity).toHaveLength(14);
    expect(result.current.activity[13]).toBe(true); // today
    expect(result.current.activity[12]).toBe(true); // yesterday
    expect(result.current.currentStreak).toBe(2);
    expect(result.current.longestStreak).toBe(2);
    expect(result.current.trainingSince).not.toBeNull();
    expect(result.current.totalTrainingDays).toBeGreaterThanOrEqual(11);
    // Grouped by cycle, first-seen order: cycle 2 (today, yesterday) then cycle 1.
    expect(result.current.grouped).toHaveLength(2);
    expect(result.current.grouped[0]?.cycle).toBe(2);
    expect(result.current.grouped[0]?.sessions).toHaveLength(2);
    expect(result.current.grouped[1]?.cycle).toBe(1);
    expect(result.current.grouped[1]?.sessions).toHaveLength(1);
    expect(result.current.filteredRows).toHaveLength(3);
  });

  it('onRefresh invokes refetch on all five queries', async () => {
    const { result } = renderHook(() => useHistoryScreenData(ALL_FILTER), { wrapper });

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(mockSessionsStub.refetch).toHaveBeenCalledTimes(1);
    expect(mockPrIdsStub.refetch).toHaveBeenCalledTimes(1);
    expect(mockPrsStub.refetch).toHaveBeenCalledTimes(1);
    expect(mockSettingsStub.refetch).toHaveBeenCalledTimes(1);
    expect(mockLifetimeVolumeStub.refetch).toHaveBeenCalledTimes(1);
  });

  it('exposes lifetimeVolume + displayUnit derived from the settings query', () => {
    mockLifetimeVolumeStub.data = 25_000;
    mockSettingsStub.data = {
      storageUnit: 'lbs',
      displayUnit: 'kg',
      enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
    };
    const { result } = renderHook(() => useHistoryScreenData(ALL_FILTER), { wrapper });
    expect(result.current.lifetimeVolume).toBe(25_000);
    expect(result.current.displayUnit).toBe('kg');
  });
});
