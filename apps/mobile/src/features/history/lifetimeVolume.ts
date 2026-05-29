// BBB is included (added loop-008) — per-session 'volumeOfWorkingSets' in domain/summary.ts still excludes it
// because the receipt's "Volume · working sets" band is 5/3/1 main work only; BBB is a sibling, not a sum.
import type { Session } from '@/data/accessors/session';
import type { SetLog } from '@/domain/types';

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

function groupThousands(n: number): string {
  const sign = n < 0 ? '-' : '';
  const digits = String(Math.abs(n));
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    groups.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return `${sign}${groups.join(',')}`;
}

function oneDecimal(n: number): string {
  const truncated = Math.floor(n * 10) / 10;
  if (truncated === Math.floor(truncated)) return String(Math.floor(truncated));
  return truncated.toFixed(1);
}
