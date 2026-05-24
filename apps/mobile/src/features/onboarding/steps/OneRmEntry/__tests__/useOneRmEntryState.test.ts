import { renderHook } from '@testing-library/react-native';
import type { LiftInput } from '../../../hooks/useOnboardingState';
import { useOneRmEntryState } from '../useOneRmEntryState';

function liftInput(overrides: Partial<LiftInput> = {}): LiftInput {
  return { mode: 'direct', weight: 0, reps: 1, ...overrides };
}

describe('useOneRmEntryState', () => {
  it('returns lb step (5) for lbs', () => {
    const { result } = renderHook(() =>
      useOneRmEntryState({
        data: liftInput({ weight: 200 }),
        computed: 200,
        unit: 'lbs',
        step: 1,
        total: 4,
      }),
    );
    expect(result.current.weightStep).toBe(5);
  });

  it('returns kg step (2.5) for kg', () => {
    const { result } = renderHook(() =>
      useOneRmEntryState({
        data: liftInput({ weight: 100 }),
        computed: 100,
        unit: 'kg',
        step: 1,
        total: 4,
      }),
    );
    expect(result.current.weightStep).toBe(2.5);
  });

  it('rounds the 90% training max for display', () => {
    // 200 lbs * 0.9 = 180 → snapped to 180 (already on 5 lb step).
    const { result } = renderHook(() =>
      useOneRmEntryState({
        data: liftInput({ weight: 200 }),
        computed: 200,
        unit: 'lbs',
        step: 1,
        total: 4,
      }),
    );
    expect(result.current.tm).toBe(180);
  });

  it('flags the last step', () => {
    const { result: notLast } = renderHook(() =>
      useOneRmEntryState({
        data: liftInput(),
        computed: 100,
        unit: 'lbs',
        step: 1,
        total: 4,
      }),
    );
    expect(notLast.current.isLast).toBe(false);
    const { result: last } = renderHook(() =>
      useOneRmEntryState({
        data: liftInput(),
        computed: 100,
        unit: 'lbs',
        step: 4,
        total: 4,
      }),
    );
    expect(last.current.isLast).toBe(true);
  });

  it('shows the hint and tailors copy by mode when computed=0', () => {
    const direct = renderHook(() =>
      useOneRmEntryState({
        data: liftInput({ mode: 'direct' }),
        computed: 0,
        unit: 'lbs',
        step: 1,
        total: 4,
      }),
    );
    expect(direct.result.current.hintVisible).toBe(true);
    expect(direct.result.current.hintCopy).toBe('Set a weight to continue');

    const calc = renderHook(() =>
      useOneRmEntryState({
        data: liftInput({ mode: 'calculate' }),
        computed: 0,
        unit: 'lbs',
        step: 1,
        total: 4,
      }),
    );
    expect(calc.result.current.hintCopy).toBe('Enter a weight and reps to continue');
  });

  it('hides the hint once a positive 1RM is computed', () => {
    const { result } = renderHook(() =>
      useOneRmEntryState({
        data: liftInput({ weight: 200 }),
        computed: 200,
        unit: 'lbs',
        step: 1,
        total: 4,
      }),
    );
    expect(result.current.hintVisible).toBe(false);
  });
});
