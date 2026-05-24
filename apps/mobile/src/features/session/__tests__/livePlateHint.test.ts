import { derivePlateChangeHint } from '../livePlateHint';

describe('derivePlateChangeHint', () => {
  it('returns null on the first set (no prior to compare against)', () => {
    expect(
      derivePlateChangeHint({
        week: 1,
        setIndex: 0,
        trainingMaxSnapshot: 315,
        storageUnit: 'lbs',
        prescribedWeight: 205,
      }),
    ).toBeNull();
  });

  it('returns "+N lb per side vs set 1" when the next set is heavier', () => {
    // Week 1 prescription: 65% / 75% / 85% of TM
    // TM 315: set1 = 205 (snap), set2 = 235 (snap)
    // Δ = (235 - 205) / 2 = 15 per side
    expect(
      derivePlateChangeHint({
        week: 1,
        setIndex: 1,
        trainingMaxSnapshot: 315,
        storageUnit: 'lbs',
        prescribedWeight: 235,
      }),
    ).toBe('+15 lb per side vs set 1');
  });

  it('returns the kg glyph when storage unit is kg', () => {
    // TM 140 kg, week 1: set1 = 90 (65% snap), set2 = 105 (75% snap to 2.5)
    // Δ = (105 - 90) / 2 = 7.5 per side
    const hint = derivePlateChangeHint({
      week: 1,
      setIndex: 1,
      trainingMaxSnapshot: 140,
      storageUnit: 'kg',
      prescribedWeight: 105,
    });
    expect(hint).toMatch(/kg per side vs set 1$/);
  });

  it('returns null when the per-side delta is zero', () => {
    // Force prescribedWeight to equal the previous set's snapped value
    expect(
      derivePlateChangeHint({
        week: 1,
        setIndex: 1,
        trainingMaxSnapshot: 315,
        storageUnit: 'lbs',
        prescribedWeight: 205, // same as set1 in this contrived scenario
      }),
    ).toBeNull();
  });

  it('signals the correct set ordinal on set 3', () => {
    const hint = derivePlateChangeHint({
      week: 1,
      setIndex: 2,
      trainingMaxSnapshot: 315,
      storageUnit: 'lbs',
      prescribedWeight: 270,
    });
    expect(hint).toMatch(/vs set 2$/);
  });
});
