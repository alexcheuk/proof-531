import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { View } from 'react-native';

export type HistorySession = {
  id: number;
  completedAt: Date;
  liftId: string;
  liftLabel: string;
  week: 1 | 2 | 3 | 4;
  cycleNumber: number;
  topWeight: number;
  topReps: number;
  amrap: boolean;
  e1rm: number;
  isPR: boolean;
};

export type HistorySessionRowProps = {
  session: HistorySession;
  unit: 'lbs' | 'kg';
};

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function HistorySessionRow({ session, unit }: HistorySessionRowProps) {
  const dateLabel = DATE_FMT.format(session.completedAt);
  const repsSuffix = session.amrap ? '+' : '';
  const cycleWeekLabel = `c${session.cycleNumber}w${session.week}`;

  return (
    <Card padded testID={`history-row-${session.id}`}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: shape.rSm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: shape.rSm, flex: 1 }}>
          <Text variant="small" tone="ink2">
            {dateLabel}
          </Text>
          <Caps>{session.liftLabel}</Caps>
        </View>
        <View
          style={{
            backgroundColor: colors.bg2,
            paddingVertical: shape.rXs,
            paddingHorizontal: shape.rSm,
            borderRadius: shape.rPill,
          }}
        >
          <Caps>{cycleWeekLabel}</Caps>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: shape.rXs,
          marginTop: shape.rXs,
        }}
      >
        <WeightNum value={session.topWeight} size="sm" />
        <Text variant="small" tone="ink1">
          {`× ${session.topReps}${repsSuffix} ${unit}`}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: shape.rSm,
          marginTop: shape.rXs,
        }}
      >
        <Caps>{`e1RM ${session.e1rm}`}</Caps>
        {session.isPR ? <Caps style={{ color: colors.hot }}>PR</Caps> : null}
      </View>
    </Card>
  );
}

export default HistorySessionRow;
