import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Card } from '@/design/primitives/Card';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { BestLift } from '../bestLift';
import { formatLifetimeVolume } from '../lifetimeVolume';
import { AchievementCaption } from './AchievementCaption';
import { AchievementStat } from './AchievementStat';
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
  /**
   * Real-world current streak (days). When equal to `longestStreak` and
   * ≥ 3, the Best streak chip is tagged "MATCHING NOW" to celebrate the
   * user being on their longest run ever.
   */
  currentStreak?: number;
  /** Date of the user's first completed session — drives the "training since" caption. */
  trainingSince?: Date | null;
  /** Total elapsed days since first session. Caption only renders when ≥ 30. */
  totalTrainingDays?: number;
  /**
   * Lifetime sum of `prescribedWeight × actualReps` across every working/amrap
   * SetLog in completed sessions. Surfaces as a third "total volume" stat
   * cell beside `sessions filed` + `personal records` — only when > 0.
   */
  lifetimeVolume?: number;
  /** Display unit for the lifetime-volume glyph. Defaults to `lbs`. */
  unit?: 'lbs' | 'kg';
  /**
   * Sessions completed in the current ISO week (Mon-Sun). When ≥ 1, a
   * "★ This week · N sessions" caption renders — a short-loop feedback
   * signal so the user sees progress without waiting for a full cycle.
   */
  sessionsThisWeek?: number;
};

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatTrainingSince(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

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
  currentStreak,
  trainingSince,
  totalTrainingDays,
  lifetimeVolume,
  unit,
  sessionsThisWeek,
}: AchievementStripProps) {
  const { layout } = useTheme();
  if (filed === 0) return null;
  const showLongest = (longestStreak ?? 0) >= 3;
  const showTrainingSince = trainingSince !== null && (totalTrainingDays ?? 0) >= 30;
  const isMatchingBest =
    showLongest && (currentStreak ?? 0) >= 3 && currentStreak === longestStreak;
  const showVolume = (lifetimeVolume ?? 0) > 0;
  const volumeDisplay = showVolume ? formatLifetimeVolume(lifetimeVolume ?? 0, unit ?? 'lbs') : '';
  const showThisWeek = (sessionsThisWeek ?? 0) >= 1;
  return (
    <Card
      borders="bottom"
      style={{ marginHorizontal: layout.gutter, marginTop: 4, marginBottom: 4, gap: 14 }}
      py="md"
      testID="history-achievements"
    >
      <Row justify="space-between" align="flex-end">
        <AchievementStat label={filed === 1 ? 'session filed' : 'sessions filed'} value={filed} />
        <AchievementStat
          label={prs === 1 ? 'personal record' : 'personal records'}
          value={prs}
          testID="history-achievements-prs"
        />
        {showVolume ? (
          <AchievementStat
            label="total volume"
            value={volumeDisplay}
            testID="history-achievements-volume"
          />
        ) : null}
      </Row>
      {showThisWeek ? (
        <AchievementCaption testID="history-this-week">
          {`This week · ${sessionsThisWeek} ${sessionsThisWeek === 1 ? 'session' : 'sessions'}`}
        </AchievementCaption>
      ) : null}
      {bestLift ? (
        <AchievementCaption testID="history-best-lift">
          {`Best · ${liftDisplayName(bestLift.lift)} ${bestLift.e1RMDisplay} ${bestLift.unitGlyph}`}
        </AchievementCaption>
      ) : null}
      {showLongest ? (
        <AchievementCaption testID="history-longest-streak">
          {isMatchingBest
            ? `Best streak · ${longestStreak} days · MATCHING NOW`
            : `Best streak · ${longestStreak} days`}
        </AchievementCaption>
      ) : null}
      <ActivitySparkline activity={activity} />
      {showTrainingSince && trainingSince ? (
        <CapsLabel
          size="xs"
          color="ink3"
          style={{ letterSpacing: 1.4 }}
          testID="history-training-since"
        >
          {`Training since ${formatTrainingSince(trainingSince)} · ${totalTrainingDays} days`}
        </CapsLabel>
      ) : null}
    </Card>
  );
}
