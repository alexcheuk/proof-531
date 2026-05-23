import type { Session } from '@/data/accessors/session';
/**
 * Single row in the History list — one completed/in-progress/cancelled
 * session. Uses the `LedgerRow` primitive for chrome and `LedgerRowLabel` /
 * `LedgerRowValue` for the two columns.
 *
 * Left column: lift name (primary) + dated/status caption (secondary).
 * Right column: cycle/week glyph (e.g. `C2 · W3`) (value) + status (sub).
 *
 * Visual fidelity against the PWA list is checked manually — the PWA
 * placeholder does not yet ship a list, so this composition is the first
 * concrete shape. Tokens come exclusively from `LedgerRow`.
 */
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { dateLabel, liftDisplayName } from '@/domain/labels';
import type { Week } from '@/domain/types';

function statusCaps(status: Session['status']): string {
  switch (status) {
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    case 'in_progress':
      return 'IN PROGRESS';
  }
}

export function SessionListRow({ session, first = false }: { session: Session; first?: boolean }) {
  const date = new Date(session.startedAt);
  const dateText = dateLabel(date);
  const week = session.week as Week;
  return (
    <LedgerRow first={first} testID={`history-row-${session.id}`}>
      <LedgerRowLabel primary={liftDisplayName(session.lift)} secondary={dateText} />
      <LedgerRowValue
        value={`C${session.cycle} · W${week}`}
        sub={statusCaps(session.status)}
        numeric
      />
    </LedgerRow>
  );
}
