import { renderHook } from '@testing-library/react-native';
import { useLiftPageState } from '../useLiftPageState';

describe('useLiftPageState', () => {
  it('returns empty when tm is null', () => {
    const { result } = renderHook(() =>
      useLiftPageState({
        week: 1,
        storageUnit: 'lbs',
        displayUnit: 'lbs',
        plateSet: 'standard',
        tm: null,
      }),
    );
    expect(result.current).toEqual({ empty: true });
  });

  it('returns derived top-set values for a populated TM (week 1, lbs)', () => {
    const { result } = renderHook(() =>
      useLiftPageState({
        week: 1,
        storageUnit: 'lbs',
        displayUnit: 'lbs',
        plateSet: 'standard',
        tm: 250,
      }),
    );
    if (result.current.empty) {
      throw new Error('expected non-empty');
    }
    // Week 1 top set is 85% — 250 * 0.85 = 212.5, snapped to 5 lb step.
    expect(result.current.topSet.pct).toBeCloseTo(0.85);
    expect(result.current.topWeight).toBe(215);
    expect(result.current.tmDisplay).toBe(250);
    // 215 lb plate-side decomposition: bar + 2× perSide must equal weight.
    const perSideTotal = result.current.perSide.reduce((s, p) => s + p, 0);
    expect(2 * perSideTotal).toBe(215 - 45); // 170 lb in plates total
  });

  it('week 4: top set is the TM test (100% TM, kind tm-test)', () => {
    const { result } = renderHook(() =>
      useLiftPageState({
        week: 4,
        storageUnit: 'lbs',
        displayUnit: 'lbs',
        plateSet: 'standard',
        tm: 250,
      }),
    );
    if (result.current.empty) {
      throw new Error('expected non-empty');
    }
    expect(result.current.topSet.pct).toBe(1.0);
    expect(result.current.topSet.kind).toBe('tm-test');
    // 100% of 250 lb TM is 250 lb (already snapped).
    expect(result.current.topWeight).toBe(250);
  });

  it('snaps on storage then converts for display (kg storage, lbs display)', () => {
    // 100 kg TM at 85% = 85 kg, snapped to 2.5 kg.
    const { result } = renderHook(() =>
      useLiftPageState({
        week: 1,
        storageUnit: 'kg',
        displayUnit: 'lbs',
        plateSet: 'kg-standard',
        tm: 100,
      }),
    );
    if (result.current.empty) {
      throw new Error('expected non-empty');
    }
    expect(result.current.tmDisplay).toBeGreaterThan(0);
    expect(result.current.topWeight).toBeGreaterThan(0);
  });
});
