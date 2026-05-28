import { fc, test as fcTest } from '@fast-check/jest';
import {
  REST_STEP_MS,
  extendDeadline,
  isExpired,
  remainingMs,
  remainingSeconds,
} from '../restDeadline';

describe('restDeadline', () => {
  describe('remainingMs', () => {
    it('is the signed gap to the deadline', () => {
      expect(remainingMs(10_000, 3_000)).toBe(7_000);
      expect(remainingMs(10_000, 12_000)).toBe(-2_000);
      expect(remainingMs(10_000, 10_000)).toBe(0);
    });

    fcTest.prop([fc.integer(), fc.integer()])('remainingMs + now === deadline', (endsAt, now) => {
      expect(remainingMs(endsAt, now) + now).toBe(endsAt);
    });
  });

  describe('remainingSeconds', () => {
    it('rounds to the nearest second and goes negative in overtime', () => {
      expect(remainingSeconds(10_000, 7_400)).toBe(3); // 2.6s → 3
      expect(remainingSeconds(10_000, 10_000)).toBe(0);
      expect(remainingSeconds(10_000, 12_500)).toBe(-2); // -2.5 → -2 (Math.round half toward +inf)
    });
  });

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
