import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Card } from '@/design/primitives/Card';
import { Heading } from '@/design/primitives/Heading';
import { Row } from '@/design/primitives/Row';
import { liftDisplayName } from '@/domain/labels';
import { View } from 'react-native';
import type { BestLift } from '../bestLift';
import { ActivitySparkline } from './ActivitySparkline';

export type AchievementStripProps = {
  /** Total completed sessions across all time. */
  filed: number;
  /** Sessions that produced at least one PR. */
  prs: number;
  /** Oldest-first activity bitmap, one boolean per day in the lookback window. */
  activity: ReadonlyArray<boolean>;
  /** Heaviest PR; when present, surfaces as "★ Best · Bench 215 lb" chip. */
  bestLift?: BestLift | null;
  /** Lifetime longest training streak (days). Surfaces when ≥ 3. */
  longestStreak?: number;
};

/**
 * Lifetime achievement strip rendered under the History title block.
 *
 * Renders nothing when the user has no completed sessions yet — the empty
 * state below the strip already speaks to that case.
 */
export function AchievementStrip({
  filed,
  prs,
  activity,
  bestLift,
  longestStreak,
}: AchievementStripProps) {
  if (filed === 0) return null;
  const showLongest = (longestStreak ?? 0) >= 3;
  return (
    <Card
      borders="bottom"
      style={{ marginHorizontal: 24, marginTop: 4, marginBottom: 4, gap: 14 }}
      py="md"
      testID="history-achievements"
    >
      <Row justify="space-between" align="flex-end">
        <Stat label={filed === 1 ? 'session filed' : 'sessions filed'} value={filed} />
        <Stat
          label={prs === 1 ? 'personal record' : 'personal records'}
          value={prs}
          testID="history-achievements-prs"
        />
      </Row>
      {bestLift ? (
        <CapsLabel size="xs" weight="semibold" color="ink1" testID="history-best-lift">
          {`★ Best · ${liftDisplayName(bestLift.lift)} ${bestLift.e1RMDisplay} ${bestLift.unitGlyph}`}
        </CapsLabel>
      ) : null}
      {showLongest ? (
        <CapsLabel size="xs" weight="semibold" color="ink1" testID="history-longest-streak">
          {`★ Best streak · ${longestStreak} days`}
        </CapsLabel>
      ) : null}
      <ActivitySparkline activity={activity} />
    </Card>
  );
}

type StatProps = {
  label: string;
  value: number;
  testID?: string;
};

function Stat({ label, value, testID }: StatProps) {
  return (
    <View>
      <Heading size="s" numeric {...(testID !== undefined ? { testID } : {})}>
        {value}
      </Heading>
      <CapsLabel size="xs" color="ink3" style={{ marginTop: 4 }}>
        {label}
      </CapsLabel>
    </View>
  );
}
