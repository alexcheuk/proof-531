/**
 * Lifetime-volume helpers — cross-session aggregator that lives in `features/`
 * rather than `domain/` because it has to fan out across many sessions'
 * SetLog lists at once. `src/domain/summary.ts` stays per-session-pure.
 *
 * "Volume" here is the SUM of `prescribedWeight × actualReps` across every
 * `working` / `amrap` / `bbb` SetLog belonging to a session whose
 * `status === 'completed'`. Warmups + generic assistance rows are excluded
 * (warmups don't accrue meaningful volume; assistance isn't part of the
 * program yet). BBB was added to the kind list in loop-008 when the BBB
 * prompt screen started writing rows; this helper followed in loop-012 so
 * it matches the SQL accessor's contract.
 *
 * Note: `volumeOfWorkingSets` in `domain/summary.ts` still excludes BBB
 * because the session-receipt's "Volume · working sets" band is
 * 5/3/1-main-work specifically; the BBB row is a sibling, not a sum.
 * The single-session vs cross-session split is intentional.
 *
 * Pure (no React, no Drizzle, no async). Lives behind a TanStack Query hook
 * + Drizzle accessor in `data/` for the actual SQL aggregation.
 */
import type { Session } from '@/data/accessors/session';
import type { SetLog } from '@/domain/types';

/**
 * Sum of `prescribedWeight × actualReps` across every working/amrap/bbb
 * set log belonging to completed sessions. Mirrors `getLifetimeVolume`'s
 * SQL filter so the in-memory math and the production query return the
 * same number for the same inputs.
 *
 * Defensive: skips uncompleted/cancelled sessions (i.e. status !==
 * 'completed'), non-counted rows (warmup / assistance), and sessions
 * with no logs in the map. Returns `0` when `sessions` is empty.
 *
 * NOTE: a SQL accessor (`getLifetimeVolume`) is the production path —
 * this helper exists so the math is unit-testable and so callers that
 * already have the rows in-memory (e.g. tests) don't have to round-trip
 * the DB.
 */
export function computeLifetimeVolume(
  sessions: ReadonlyArray<Session>,
  setLogsBySession: ReadonlyMap<number, ReadonlyArray<SetLog>>,
): number {
  let total = 0;
  for (const session of sessions) {
    if (session.status !== 'completed') continue;
    const logs = setLogsBySession.get(session.id);
    if (!logs) continue;
    for (const log of logs) {
      if (log.kind !== 'working' && log.kind !== 'amrap' && log.kind !== 'bbb') continue;
      total += log.prescribedWeight * log.actualReps;
    }
  }
  return total;
}

/**
 * Compact display string for a (potentially huge) volume number.
 *
 *   - under 10,000 → comma-separated integer like `8,400 lb`
 *   - under 1,000,000 → `12.4k lb` (one decimal, drop trailing zero)
 *   - 1,000,000+ → `1.2M lb` (one decimal, drop trailing zero)
 *
 * Locale-stable: builds the integer thousands-separator string by hand
 * rather than calling `toLocaleString`. The unit glyph follows the PWA
 * convention from `domain/units.displayUnit`: `lb` for `lbs`, `kg` for `kg`.
 *
 * Negative / NaN inputs collapse to `0 lb`-style output (with the right glyph).
 */
export function formatLifetimeVolume(total: number, unit: 'lbs' | 'kg'): string {
  const glyph = unit === 'lbs' ? 'lb' : 'kg';
  if (!Number.isFinite(total) || total <= 0) return `0 ${glyph}`;
  if (total < 10_000) {
    return `${groupThousands(Math.round(total))} ${glyph}`;
  }
  if (total < 1_000_000) {
    return `${oneDecimal(total / 1_000)}k ${glyph}`;
  }
  return `${oneDecimal(total / 1_000_000)}M ${glyph}`;
}

/** `1234567` → `1,234,567`. Locale-stable. */
function groupThousands(n: number): string {
  const sign = n < 0 ? '-' : '';
  const digits = String(Math.abs(n));
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    groups.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return `${sign}${groups.join(',')}`;
}

/**
 * `12.4` / `12` (when trailing `.0` would otherwise show). One decimal max.
 * Floors to one decimal place (truncates rather than rounds) so a strict
 * progression of input doesn't surprise the user with bumped digits.
 */
function oneDecimal(n: number): string {
  const truncated = Math.floor(n * 10) / 10;
  // Avoid `12.0 → "12.0"` — drop the trailing `.0`.
  if (truncated === Math.floor(truncated)) return String(Math.floor(truncated));
  return truncated.toFixed(1);
}
