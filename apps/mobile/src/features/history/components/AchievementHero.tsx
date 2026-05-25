import { Row } from '@/design/primitives/Row';
import { AchievementStat } from './AchievementStat';

export type AchievementHeroProps = {
  /** Total completed sessions across all time. */
  filed: number;
  /** Sessions that produced at least one PR. */
  prs: number;
  /** Pre-formatted lifetime volume (e.g. "12.4k lb"). Hidden when empty. */
  volumeDisplay?: string;
};

/**
 * Top stat row of the History achievement strip. Three numeric cells:
 * sessions filed, personal records, and (when available) total volume.
 * Pluralization is owned here so the parent strip stays composition-only.
 */
export function AchievementHero({ filed, prs, volumeDisplay }: AchievementHeroProps) {
  return (
    <Row justify="space-between" align="flex-end">
      <AchievementStat label={filed === 1 ? 'session filed' : 'sessions filed'} value={filed} />
      <AchievementStat
        label={prs === 1 ? 'personal record' : 'personal records'}
        value={prs}
        testID="history-achievements-prs"
      />
      {volumeDisplay ? (
        <AchievementStat
          label="total volume"
          value={volumeDisplay}
          testID="history-achievements-volume"
        />
      ) : null}
    </Row>
  );
}
