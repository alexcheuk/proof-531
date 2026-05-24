import fc from 'fast-check';
import { BAR_KG, BAR_LBS, decompose, plateLoadInstruction } from '../plates';

describe('decompose', () => {
  it('returns empty perSide when target ≤ bar (lbs)', () => {
    expect(decompose(45, 'standard')).toEqual({ perSide: [], leftover: 0 });
    expect(decompose(30, 'standard').perSide).toEqual([]);
  });

  it('225 lb on standard bar → perSide = [45, 45]', () => {
    expect(decompose(225, 'standard')).toEqual({ perSide: [45, 45], leftover: 0 });
  });

  it('135 lb → [45]; 95 lb → [25]; 65 lb → [10]', () => {
    expect(decompose(135, 'standard').perSide).toEqual([45]);
    expect(decompose(95, 'standard').perSide).toEqual([25]);
    expect(decompose(65, 'standard').perSide).toEqual([10]);
  });

  it('100 kg on kg bar → 80 kg loaded → 40 per side → [25, 15]', () => {
    expect(decompose(100, 'kg-standard').perSide).toEqual([25, 15]);
  });

  it('returns greedy descending order', () => {
    const { perSide } = decompose(495, 'standard'); // 450 lb loaded → 225 per side
    // 225 / 45 = 5 → [45, 45, 45, 45, 45]
    expect(perSide).toEqual([45, 45, 45, 45, 45]);
    expect([...perSide].sort((a, b) => b - a)).toEqual(perSide);
  });

  it('property: bar + sum(plates) × 2 ≈ target within smallest-plate tolerance', () => {
    fc.assert(
      fc.property(
        fc
          .integer({ min: 0, max: 200 })
          .map((n) => n * 5), // multiples of 5 lbs (valid LBS targets)
        (target) => {
          const { perSide, leftover } = decompose(target, 'standard');
          const sumPerSide = perSide.reduce((a, b) => a + b, 0);
          const reconstructed = BAR_LBS + sumPerSide * 2 + leftover;
          // Smallest plate is 2.5 lb; tolerance is 1 (well within smallest plate),
          // since leftover already accounts for the gap.
          return Math.abs(reconstructed - target) < 1;
        },
      ),
    );
  });

  it('property (kg): bar + sum × 2 + leftover ≈ target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }).map((n) => n * 2.5),
        (target) => {
          const { perSide, leftover } = decompose(target, 'kg-standard');
          const sum = perSide.reduce((a, b) => a + b, 0);
          const reconstructed = BAR_KG + sum * 2 + leftover;
          return Math.abs(reconstructed - target) < 0.5;
        },
      ),
    );
  });
});

describe('plateLoadInstruction', () => {
  it('renders the load pattern for a typical load (lbs)', () => {
    // 185 lb on 45 bar → per-side [25, 10, 5]? actually decompose(185) = bar 45 + 140 → 70/side → [45, 25].
    // Use the spec example: 185 lb → "load: 25 + 10 / side over 45 bar" comes from per-side [25,10].
    // Pass the per-side explicitly so the helper is independent of plate math.
    expect(plateLoadInstruction([25, 10], 45, 0, 'lbs')).toBe('load: 25 + 10 / side over 45 bar');
  });

  it('renders the load pattern for a single plate (lbs)', () => {
    expect(plateLoadInstruction([45], 45, 0, 'lbs')).toBe('load: 45 / side over 45 bar');
  });

  it('renders the load pattern for a kg load', () => {
    expect(plateLoadInstruction([25, 15], 20, 0, 'kg')).toBe('load: 25 + 15 / side over 20 bar');
  });

  it('renders the unload pattern when currentLoad > nextLoad', () => {
    // currentLoad=205, nextLoad implied by perSide reconstruction = bar 45 + 2 × (25+10) = 115 — but
    // we expose this via nextLoad: helper accepts (perSide, barWeight, currentLoad, unit) and
    // computes its own nextLoad as bar + 2 × sum(perSide).
    expect(plateLoadInstruction([25, 10], 45, 205, 'lbs')).toBe(
      'unload to 115 lb — strip the heavy plates',
    );
  });

  it('renders the load pattern when currentLoad equals nextLoad', () => {
    // No change in load → still treated as "load:" instruction (boundary: not strictly greater).
    expect(plateLoadInstruction([25, 10], 45, 115, 'lbs')).toBe('load: 25 + 10 / side over 45 bar');
  });

  it('renders empty per-side as bar-only (load:)', () => {
    expect(plateLoadInstruction([], 45, 0, 'lbs')).toBe('load: bar only — 45 lb');
  });

  it('property: load pattern contains plates in the order given, joined by " + "', () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.constantFrom(45, 35, 25, 10, 5, 2.5), { minLength: 1, maxLength: 6 })
          .map((arr) => [...arr].sort((a, b) => b - a)),
        (perSide) => {
          const out = plateLoadInstruction(perSide, 45, 0, 'lbs');
          // The helper renders `load: a + b + c / side over 45 bar`
          const platesString = perSide.join(' + ');
          return out.includes(platesString);
        },
      ),
    );
  });
});
