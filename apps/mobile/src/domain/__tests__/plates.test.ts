import fc from 'fast-check';
import { BAR_KG, BAR_LBS, decompose } from '../plates';

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
