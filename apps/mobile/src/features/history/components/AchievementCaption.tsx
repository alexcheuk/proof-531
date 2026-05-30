import { CapsLabel } from '@/design/primitives/CapsLabel';
import type { ReactNode } from 'react';

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
