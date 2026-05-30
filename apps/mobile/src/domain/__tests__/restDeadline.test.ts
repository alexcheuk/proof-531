import { fc, test as fcTest } from '@fast-check/jest';
import { REST_STEP_MS, extendDeadline, isExpired } from '../restDeadline';

describe('restDeadline', () => {
  describe('isExpired', () => {
    it('is true once now reaches or passes the deadline', () => {
      expect(isExpired(10_000, 9_999)).toBe(false);
      expect(isExpired(10_000, 10_000)).toBe(true);
      expect(isExpired(10_000, 10_001)).toBe(true);
    });

    fcTest.prop([fc.integer(), fc.integer()])('matches now >= deadline', (endsAt, now) => {
      expect(isExpired(endsAt, now)).toBe(now >= endsAt);
    });
  });

  describe('extendDeadline', () => {
    it('defaults to a +30s step', () => {
      expect(extendDeadline(10_000)).toBe(10_000 + REST_STEP_MS);
      expect(REST_STEP_MS).toBe(30_000);
    });

    fcTest.prop([fc.integer(), fc.integer({ min: 1, max: 600_000 })])(
      'always pushes the deadline strictly later for a positive step',
      (endsAt, step) => {
        expect(extendDeadline(endsAt, step)).toBeGreaterThan(endsAt);
      },
    );
  });
});
