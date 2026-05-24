/**
 * Single row in the History list — one completed/in-progress/cancelled
 * session. Tapping a row drills into the session's surface:
 *   - completed → /session/complete?sessionId  (the stamped receipt)
 *   - in_progress → /session/today?lift        (resume)
 *   - cancelled → no-op (no detail surface yet)
 *
 * Left column: lift name (primary) + dated/status caption (secondary).
 * Right column: a small tappable PR star (when this session set a PR) +
 * cycle/week glyph (value) + status (sub). The PR star is its own press
 * target so users can jump straight to a per-lift filter on tap; tapping
 * the rest of the row still navigates to the session surface.
 */
import { goTo } from '@/app/routes';
import type { Session } from '@/data/accessors/session';
import { useDebouncedPress } from '@/design/hooks/useDebouncedPress';
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { dateLabel, liftDisplayName } from '@/domain/labels';
import type { Lift, Week } from '@/domain/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, Text as RNText, type TextStyle } from 'react-native';

function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

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
  /**
   * Optional handler fired when the user taps the `★ PR` chip. When
   * provided, the chip becomes its own press target (the surrounding row
   * still navigates to the session surface). Receives the row's lift so
   * the parent can activate a per-lift filter.
   */
  onPressPr?: (lift: Lift) => void;
};

export function SessionListRow({
  session,
  first = false,
  hasPr = false,
  onPressPr,
}: SessionListRowProps) {
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
  const onPress = useDebouncedPress(navigate, { disabled: !tappable });

  const handlePrTap = useCallback(() => {
    if (!onPressPr) return;
    void Haptics.selectionAsync();
    onPressPr(lift);
  }, [lift, onPressPr]);

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

  // Today's row gets a 2px ink left accent so the user can spot the
  // just-finished session as they swipe past the list. Local-midnight
  // bucketing matches the History activity sparkline so the visual signal
  // is consistent across the tab.
  const isToday = isSameLocalDay(session.startedAt, Date.now());
  const todayAccentStyle = isToday
    ? { borderLeftWidth: 2, borderLeftColor: colors.ink0, paddingLeft: 10 }
    : null;

  const prChip = hasPr ? (
    onPressPr ? (
      <Pressable
        onPress={handlePrTap}
        accessibilityRole="button"
        accessibilityLabel={`Show only ${liftDisplayName(session.lift)} sessions`}
        accessibilityHint="Filters the History list to this lift"
        testID={`history-row-${session.id}-pr`}
        style={({ pressed }) => [
          { paddingVertical: 2, paddingHorizontal: 4 },
          pressed ? { opacity: 0.5 } : null,
        ]}
      >
        <RNText style={starStyle}>★ PR</RNText>
      </Pressable>
    ) : (
      <RNText style={starStyle} testID={`history-row-${session.id}-pr`}>
        ★ PR
      </RNText>
    )
  ) : null;

  return (
    <LedgerRow
      first={first}
      testID={`history-row-${session.id}`}
      accessibilityLabel={a11yLabel}
      {...(tappable ? { onPress } : {})}
      {...(todayAccentStyle ? { style: todayAccentStyle } : {})}
    >
      <LedgerRowLabel primary={liftDisplayName(session.lift)} secondary={dateText} />
      <Row gap="sm">
        {prChip}
        <LedgerRowValue
          value={`C${session.cycle} · W${week}`}
          sub={statusCaps(session.status)}
          numeric
        />
      </Row>
    </LedgerRow>
  );
}
