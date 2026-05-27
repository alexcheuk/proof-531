import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Card } from '@/design/primitives/Card';
import { useTheme } from '@/design/theme';
import type { BestLift } from '../bestLift';
import { formatLifetimeVolume } from '../lifetimeVolume';
import { formatTrainingSince } from '../trainingSince';
import { AchievementCaptions } from './AchievementCaptions';
import { AchievementHero } from './AchievementHero';
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
  /** Sessions completed in the current ISO week (Mon-Sun). */
  sessionsThisWeek?: number;
};

/**
 * Lifetime achievement strip rendered under the History title block.
 *
 * Composition shell — the stat row, caption stack, and sparkline each
 * live in their own files. Renders nothing when the user has no
 * completed sessions yet (the empty state below the strip already
 * speaks to that case).
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
  const showVolume = (lifetimeVolume ?? 0) > 0;
  const volumeDisplay = showVolume ? formatLifetimeVolume(lifetimeVolume ?? 0, unit ?? 'lbs') : '';
  const showTrainingSince = trainingSince !== null && (totalTrainingDays ?? 0) >= 30;
  return (
    <Card
      borders="bottom"
      style={{ marginHorizontal: layout.gutter, marginTop: 4, marginBottom: 4, gap: 14 }}
      py="md"
      testID="history-achievements"
    >
      <AchievementHero filed={filed} prs={prs} volumeDisplay={volumeDisplay} />
      <AchievementCaptions
        sessionsThisWeek={sessionsThisWeek}
        bestLift={bestLift}
        longestStreak={longestStreak}
        currentStreak={currentStreak}
      />
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
