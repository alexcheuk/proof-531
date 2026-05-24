import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { ActivitySparkline } from './ActivitySparkline';

export type AchievementStripProps = {
  /** Total completed sessions across all time. */
  filed: number;
  /** Sessions that produced at least one PR. */
  prs: number;
  /** Oldest-first activity bitmap, one boolean per day in the lookback window. */
  activity: ReadonlyArray<boolean>;
};

/**
 * Lifetime achievement strip rendered under the History title block.
 *
 * Renders nothing when the user has no completed sessions yet — the empty
 * state below the strip already speaks to that case.
 */
export function AchievementStrip({ filed, prs, activity }: AchievementStripProps) {
  const { colors, type } = useTheme();
  if (filed === 0) return null;

  const wrap: ViewStyle = {
    marginHorizontal: 24,
    marginTop: 4,
    marginBottom: 4,
    paddingTop: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    gap: 14,
  };

  const numberStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 22,
    letterSpacing: -0.66,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  return (
    <View style={wrap} testID="history-achievements">
      <Row justify="space-between" align="flex-end">
        <Stat label={filed === 1 ? 'session filed' : 'sessions filed'}>
          <RNText style={numberStyle}>{filed}</RNText>
        </Stat>
        <Stat label={prs === 1 ? 'personal record' : 'personal records'}>
          <RNText style={numberStyle} testID="history-achievements-prs">
            {prs}
          </RNText>
        </Stat>
      </Row>
      <ActivitySparkline activity={activity} />
    </View>
  );
}

type StatProps = {
  label: string;
  children: React.ReactNode;
};

function Stat({ label, children }: StatProps) {
  return (
    <View>
      {children}
      <CapsLabel size="xs" color="ink3" style={{ marginTop: 4 }}>
        {label}
      </CapsLabel>
    </View>
  );
}
