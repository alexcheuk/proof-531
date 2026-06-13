import { liftDisplayName } from '@/domain/labels';
import type { BestLift } from '../bestLift';
import { AchievementCaption } from './AchievementCaption';

export type AchievementCaptionsProps = {
  sessionsThisWeek?: number | undefined;
  bestLift?: BestLift | null | undefined;
  longestStreak?: number | undefined;
  currentStreak?: number | undefined;
};

/**
 * Conditional caption stack rendered inside the History achievement
 * strip. Each caption is independent; they appear/disappear based on
 * whether the user has enough data to make the line meaningful.
 *
 * Order is fixed (week → best lift → best streak) because the reading
 * hierarchy matters  -  short-loop signals on top, lifetime milestones below.
 */
export function AchievementCaptions({
  sessionsThisWeek,
  bestLift,
  longestStreak,
  currentStreak,
}: AchievementCaptionsProps) {
  const showThisWeek = (sessionsThisWeek ?? 0) >= 1;
  const showLongest = (longestStreak ?? 0) >= 3;
  const isMatchingBest =
    showLongest && (currentStreak ?? 0) >= 3 && currentStreak === longestStreak;
  return (
    <>
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
    </>
  );
}
