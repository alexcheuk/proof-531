import { initialOnboardingState, onboardingReducer } from '../useOnboardingState';

describe('initialOnboardingState', () => {
  it('defaults to lbs + step 1 + all four lifts enabled', () => {
    const s = initialOnboardingState();
    expect(s.step).toBe(1);
    expect(s.unit).toBe('lbs');
    expect(s.enabledLifts).toEqual(['squat', 'bench', 'deadlift', 'press']);
    expect(s.cursor).toBe(0);
  });

  it('seeds kg defaults when unit=kg', () => {
    const s = initialOnboardingState('kg');
    expect(s.unit).toBe('kg');
    expect(s.perLift.squat.weight).toBeGreaterThan(0);
  });
});

describe('onboardingReducer  -  NEXT/BACK', () => {
  it('NEXT walks step 1 → 2', () => {
    const s = onboardingReducer(initialOnboardingState(), { type: 'NEXT' });
    expect(s.step).toBe(2);
  });

  it('NEXT from step 2 → 3 with cursor reset', () => {
    const start = { ...initialOnboardingState(), step: 2 as const };
    const s = onboardingReducer(start, { type: 'NEXT' });
    expect(s.step).toBe(3);
    expect(s.cursor).toBe(0);
  });

  it('NEXT on step 2 with no lifts is a no-op', () => {
    const start = { ...initialOnboardingState(), step: 2 as const, enabledLifts: [] };
    const s = onboardingReducer(start, { type: 'NEXT' });
    expect(s.step).toBe(2);
  });

  it('NEXT on step 3 advances cursor; final cursor → step 4', () => {
    const start = { ...initialOnboardingState(), step: 3 as const, cursor: 0 };
    const after1 = onboardingReducer(start, { type: 'NEXT' });
    expect(after1.cursor).toBe(1);
    const at_last = { ...start, cursor: start.enabledLifts.length - 1 };
    const final = onboardingReducer(at_last, { type: 'NEXT' });
    expect(final.step).toBe(4);
  });

  it('BACK on step 1 is a no-op', () => {
    const s = onboardingReducer(initialOnboardingState(), { type: 'BACK' });
    expect(s.step).toBe(1);
  });

  it('BACK from step 3 cursor 0 returns to step 2', () => {
    const start = { ...initialOnboardingState(), step: 3 as const, cursor: 0 };
    const s = onboardingReducer(start, { type: 'BACK' });
    expect(s.step).toBe(2);
  });

  it('BACK from step 4 returns to step 3 at the last enabled lift', () => {
    const start = { ...initialOnboardingState(), step: 4 as const };
    const s = onboardingReducer(start, { type: 'BACK' });
    expect(s.step).toBe(3);
    expect(s.cursor).toBe(start.enabledLifts.length - 1);
  });
});

describe('onboardingReducer  -  TOGGLE_LIFT', () => {
  it('removes a lift when present', () => {
    const s = onboardingReducer(initialOnboardingState(), {
      type: 'TOGGLE_LIFT',
      lift: 'bench',
    });
    expect(s.enabledLifts).not.toContain('bench');
  });

  it('refuses to drop the last remaining lift', () => {
    const start = { ...initialOnboardingState(), enabledLifts: ['squat' as const] };
    const s = onboardingReducer(start, { type: 'TOGGLE_LIFT', lift: 'squat' });
    expect(s.enabledLifts).toEqual(['squat']);
  });

  it('adds a lift back in LIFT_ORDER position', () => {
    const start = {
      ...initialOnboardingState(),
      enabledLifts: ['squat' as const, 'press' as const],
    };
    const s = onboardingReducer(start, { type: 'TOGGLE_LIFT', lift: 'deadlift' });
    // LIFT_ORDER is squat, bench, deadlift, press  -  so deadlift slots before press.
    expect(s.enabledLifts).toEqual(['squat', 'deadlift', 'press']);
  });
});

describe('onboardingReducer  -  SET_LIFT_INPUT', () => {
  it('clamps reps into [1, 15]', () => {
    const start = initialOnboardingState();
    const high = onboardingReducer(start, {
      type: 'SET_LIFT_INPUT',
      lift: 'squat',
      patch: { reps: 99 },
    });
    expect(high.perLift.squat.reps).toBe(15);
    const low = onboardingReducer(start, {
      type: 'SET_LIFT_INPUT',
      lift: 'squat',
      patch: { reps: -5 },
    });
    expect(low.perLift.squat.reps).toBe(1);
  });

  it('clamps weight into [0, 9999]', () => {
    const start = initialOnboardingState();
    const high = onboardingReducer(start, {
      type: 'SET_LIFT_INPUT',
      lift: 'squat',
      patch: { weight: 99999 },
    });
    expect(high.perLift.squat.weight).toBe(9999);
    const low = onboardingReducer(start, {
      type: 'SET_LIFT_INPUT',
      lift: 'squat',
      patch: { weight: -50 },
    });
    expect(low.perLift.squat.weight).toBe(0);
  });

  it('preserves other lift inputs when patching one', () => {
    const start = initialOnboardingState();
    const before = start.perLift.bench;
    const s = onboardingReducer(start, {
      type: 'SET_LIFT_INPUT',
      lift: 'squat',
      patch: { weight: 300 },
    });
    expect(s.perLift.bench).toEqual(before);
  });
});

describe('onboardingReducer  -  SET_UNIT', () => {
  it('is a no-op when the unit is unchanged', () => {
    const start = initialOnboardingState('lbs');
    const s = onboardingReducer(start, { type: 'SET_UNIT', unit: 'lbs' });
    expect(s).toBe(start);
  });

  it('switches unit + re-seeds defaults when no per-lift edits exist', () => {
    const start = initialOnboardingState('lbs');
    const s = onboardingReducer(start, { type: 'SET_UNIT', unit: 'kg' });
    expect(s.unit).toBe('kg');
    // kg defaults differ from lbs defaults  -  squat goes from 225 lbs to 100 kg.
    expect(s.perLift.squat.weight).toBe(100);
  });

  it('switches unit but preserves per-lift edits when the user has typed', () => {
    const start = initialOnboardingState('lbs');
    const edited = onboardingReducer(start, {
      type: 'SET_LIFT_INPUT',
      lift: 'squat',
      patch: { weight: 315 },
    });
    const s = onboardingReducer(edited, { type: 'SET_UNIT', unit: 'kg' });
    expect(s.unit).toBe('kg');
    // squat was edited (315 != 225), so the unit flip leaves it alone.
    expect(s.perLift.squat.weight).toBe(315);
  });
});

describe('onboardingReducer  -  GOTO', () => {
  it('jumps to an arbitrary step', () => {
    const s = onboardingReducer(initialOnboardingState(), { type: 'GOTO', step: 4 });
    expect(s.step).toBe(4);
  });
});
