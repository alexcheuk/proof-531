import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';

export type LiftPageTitleProps = {
  lift: Lift;
};

// Title typography contract — frozen so LiftPage + a future split don't
// drift from each other.
const TITLE_SIZE = 64;
// PWA `tracking-[-0.04em]` × 64px = -2.56 letter spacing.
const TITLE_LETTER_SPACING = -2.56;
// PWA `leading-[0.92]` ≈ 0.92 × 64 ≈ 58.88; RN clips descenders on tight
// line heights, so we bump to 74.
const TITLE_LINE_HEIGHT = 74;

/**
 * The giant lift-name headline (e.g. "Squat.") with the amber-accent
 * period. Sized to match the PWA's hero typography on a LiftPage.
 */
export function LiftPageTitle({ lift }: LiftPageTitleProps) {
  const { spacing } = useTheme();
  return (
    <Text
      variant="sans"
      weight="bold"
      size={TITLE_SIZE}
      color="ink0"
      style={{
        lineHeight: TITLE_LINE_HEIGHT,
        letterSpacing: TITLE_LETTER_SPACING,
        marginTop: spacing.md,
      }}
    >
      {liftDisplayName(lift)}
      <Text
        variant="sans"
        weight="bold"
        size={TITLE_SIZE}
        color="amber"
        style={{ lineHeight: TITLE_LINE_HEIGHT }}
      >
        .
      </Text>
    </Text>
  );
}
