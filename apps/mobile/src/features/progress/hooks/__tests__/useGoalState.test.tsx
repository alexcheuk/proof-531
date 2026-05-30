import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

// ── mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/data/DbProvider', () => ({ useDb: () => ({ __stub: 'db' }) }));

const mockGoalData: {
  data:
    | { kind: 'tm' | '1rm'; targetValue: number; unit: 'lbs' | 'kg'; daysPerWeek: number | null }
    | undefined;
} = {
  data: undefined,
};
const mockSetGoal = jest.fn(() => Promise.resolve());
const mockSetDaysPerWeek = jest.fn(() => Promise.resolve());

jest.mock('@/data/queries/useLiftGoal', () => ({
  useLiftGoal: () => ({ data: mockGoalData.data, isError: false }),
  LIFT_GOAL_KEY: (lift: string) => ['liftGoal', lift],
}));

jest.mock('@/data/queries/useSetLiftGoal', () => ({
  useSetLiftGoal: () => ({ mutateAsync: mockSetGoal }),
}));

jest.mock('@/data/queries/useSetLiftGoalDaysPerWeek', () => ({
  useSetLiftGoalDaysPerWeek: () => ({ mutateAsync: mockSetDaysPerWeek }),
}));

import { useGoalState } from '../useGoalState';

// ── helpers ───────────────────────────────────────────────────────────────────

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const OPTS = { displayU: 'lbs' as const, storageUnit: 'lbs' as const, tmStep: 5, currentTm: 200 };

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useGoalState', () => {
  beforeEach(() => {
    mockGoalData.data = undefined;
    mockSetGoal.mockClear();
    mockSetDaysPerWeek.mockClear();
  });

  it('marks unset when no goal row is persisted', () => {
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });
    expect(result.current.unset).toBe(true);
  });

  it('defaults to tm kind and a positive draft value', () => {
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });
    expect(result.current.draftKind).toBe('tm');
    expect(result.current.draftValue).toBeGreaterThan(0);
  });

  it('seeds draft from persisted goal when one exists', () => {
    mockGoalData.data = { kind: 'tm', targetValue: 250, unit: 'lbs', daysPerWeek: null };
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });
    expect(result.current.draftKind).toBe('tm');
    expect(result.current.draftValue).toBe(250);
    expect(result.current.unset).toBe(false);
  });

  it('converts draft value when switching from tm to 1rm kind', async () => {
    mockGoalData.data = { kind: 'tm', targetValue: 270, unit: 'lbs', daysPerWeek: null };
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });

    await act(async () => {
      result.current.onKindChange('1rm');
    });

    // switching tm → 1rm divides by 0.9 and plate-snaps to 5 lb
    // 270 / 0.9 = 300 — already plate-snapped
    expect(result.current.draftKind).toBe('1rm');
    expect(result.current.draftValue % 5).toBe(0);
    expect(result.current.draftValue).toBe(300);
  });

  it('converts draft value when switching from 1rm back to tm kind', async () => {
    mockGoalData.data = { kind: '1rm', targetValue: 300, unit: 'lbs', daysPerWeek: null };
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });

    await act(async () => {
      result.current.onKindChange('tm');
    });

    // switching 1rm → tm multiplies by 0.9 and plate-snaps to 5 lb
    // 300 * 0.9 = 270 — already plate-snapped
    expect(result.current.draftKind).toBe('tm');
    expect(result.current.draftValue % 5).toBe(0);
    expect(result.current.draftValue).toBe(270);
  });

  it('plate-snaps the converted value on kind switch', async () => {
    // 1RM 315 lb → TM: Math.round(315 * 0.9) = 284, but round(283.5, 'lbs') = 285
    mockGoalData.data = { kind: '1rm', targetValue: 315, unit: 'lbs', daysPerWeek: null };
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });

    await act(async () => {
      result.current.onKindChange('tm');
    });

    expect(result.current.draftValue).toBe(285);
    expect(result.current.draftValue % 5).toBe(0);
  });

  it('calls setGoal mutation on value change', async () => {
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });

    await act(async () => {
      result.current.onValueChange(300);
    });

    expect(mockSetGoal).toHaveBeenCalledWith(
      expect.objectContaining({
        lift: 'squat',
        target: expect.objectContaining({ kind: 'tm', unit: 'lbs' }),
      }),
    );
  });

  it('calls setDaysPerWeek mutation on days-per-week change', async () => {
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });

    await act(async () => {
      result.current.onDaysPerWeekChange(3);
    });

    expect(mockSetDaysPerWeek).toHaveBeenCalledWith({ lift: 'squat', daysPerWeek: 3 });
  });

  it('exposes persistedDaysPerWeek from the goal row', () => {
    mockGoalData.data = { kind: 'tm', targetValue: 250, unit: 'lbs', daysPerWeek: 4 };
    const { result } = renderHook(() => useGoalState('squat', OPTS), { wrapper });
    expect(result.current.persistedDaysPerWeek).toBe(4);
  });

  it('plate-snaps persisted goal when converting across units (kg stored, lbs display)', () => {
    // 140 kg stored → displayWeight(140, 'kg', 'lbs') ≈ 308.647
    // Math.round → 309 (not plate-snapped), round('lbs') → 310 (correct)
    const KG_OPTS = {
      displayU: 'lbs' as const,
      storageUnit: 'kg' as const,
      tmStep: 5,
      currentTm: 308,
    };
    mockGoalData.data = { kind: 'tm', targetValue: 140, unit: 'kg', daysPerWeek: null };
    const { result } = renderHook(() => useGoalState('squat', KG_OPTS), { wrapper });
    expect(result.current.draftValue % 5).toBe(0);
  });
});
