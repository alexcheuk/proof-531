import { CapsLabel } from '@/design/primitives/CapsLabel';
import type { ReactNode } from 'react';

/**
 * One ★-prefixed CapsLabel used in the History achievement strip — "★ Best ·
 * Squat 315 lb", "★ Best streak · 12 days · MATCHING NOW", etc.
 *
 * Captures the shared visual contract (size, weight, color, glyph) so a
 * future copy change touches one file instead of four.
 */
export type AchievementCaptionProps = {
  children: ReactNode;
  testID?: string;
};

export function AchievementCaption({ children, testID }: AchievementCaptionProps) {
  return (
    <CapsLabel
      size="xs"
      weight="semibold"
      color="ink1"
      {...(testID !== undefined ? { testID } : {})}
    >
      {`★ ${children}`}
    </CapsLabel>
  );
}
