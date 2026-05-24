/**
 * Single row in the History list — one completed/in-progress/cancelled
 * session. Tapping a row drills into the session's surface:
 *   - completed → /session/complete?sessionId  (the stamped receipt)
 *   - in_progress → /session/today?lift        (resume)
 *   - cancelled → no-op (no detail surface yet)
 *
 * Left column: lift name (primary) + dated/status caption (secondary).
 * Right column: a small PR star (when this session set a PR) + cycle/week
 * glyph (value) + status (sub).
 */
import { goTo } from '@/app/routes';
import type { Session } from '@/data/accessors/session';
import { useDebouncedPress } from '@/design/hooks/useDebouncedPress';
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { dateLabel, liftDisplayName } from '@/domain/labels';
import type { Lift, Week } from '@/domain/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Text as RNText, type TextStyle } from 'react-native';

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

export type SessionListRowProps = {
  session: Session;
  first?: boolean;
  /** True when this session produced at least one PR set log. */
  hasPr?: boolean;
};

export function SessionListRow({ session, first = false, hasPr = false }: SessionListRowProps) {
  const router = useRouter();
  const { colors, type } = useTheme();
  const date = new Date(session.startedAt);
  const dateText = dateLabel(date);
  const week = session.week as Week;
  const lift = session.lift as Lift;

  const navigate = useCallback(() => {
    if (session.status === 'completed') {
      goTo.complete(router, session.id);
      return;
    }
    if (session.status === 'in_progress') {
      goTo.today(router, lift);
    }
  }, [router, session.id, session.status, lift]);

  const tappable = session.status === 'completed' || session.status === 'in_progress';
  // Debounce so a rapid double-tap can't push the same route twice (the
  // resulting back-stack of two identical screens is confusing).
  const onPress = useDebouncedPress(navigate, { disabled: !tappable });

  const a11yLabel = [
    liftDisplayName(session.lift),
    `Cycle ${session.cycle}, Week ${week}`,
    statusCaps(session.status).toLowerCase(),
    hasPr ? 'personal record' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const starStyle: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.ink0,
  };

  return (
    <LedgerRow
      first={first}
      testID={`history-row-${session.id}`}
      accessibilityLabel={a11yLabel}
      {...(tappable ? { onPress } : {})}
    >
      <LedgerRowLabel primary={liftDisplayName(session.lift)} secondary={dateText} />
      <Row gap="sm">
        {hasPr ? (
          <RNText style={starStyle} testID={`history-row-${session.id}-pr`}>
            ★ PR
          </RNText>
        ) : null}
        <LedgerRowValue
          value={`C${session.cycle} · W${week}`}
          sub={statusCaps(session.status)}
          numeric
        />
      </Row>
    </LedgerRow>
  );
}
