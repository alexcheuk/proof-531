import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import * as Haptics from 'expo-haptics';
import { Pressable, type ViewStyle } from 'react-native';

export type LiftPageTitleProps = {
  lift: Lift;
  onPress?: () => void;
};

// Title typography contract — frozen so LiftPage + a future split don't
// drift from each other.
const TITLE_SIZE = 64;
// PWA `tracking-[-0.04em]` × 64px = -2.56 letter spacing.
const TITLE_LETTER_SPACING = -2.56;
// PWA `leading-[0.92]` ≈ 0.92 × 64 ≈ 58.88; RN clips descenders on tight
// line heights, so we bump to 74.
const TITLE_LINE_HEIGHT = 74;
// ≈ 44% of the 64px title so the chevron reads as a small affordance, not a
// second word. A typography constant living with the primitive (per the
// design-system rule) — same as TITLE_SIZE above.
const CHEVRON_SIZE = 28;

export function LiftPageTitle({ lift, onPress }: LiftPageTitleProps) {
  const { spacing } = useTheme();

  const titleNode = (
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
      {/* Subtle chevron affordance — shown ONLY when the title is tappable.
          Muted ink3 (never amber — that's reserved for the period), nested
          inside the single title Text so it inherits the title's one
          accessible node and adds no separate announcement. */}
      {onPress ? (
        <Text
          variant="sans"
          weight="bold"
          size={CHEVRON_SIZE}
          color="ink3"
          style={{ lineHeight: TITLE_LINE_HEIGHT, marginLeft: spacing.xs }}
        >
          {'›'}
        </Text>
      ) : null}
    </Text>
  );

  if (!onPress) {
    return titleNode;
  }

  const pressableStyle: ViewStyle = {
    alignSelf: 'flex-start',
  };

  return (
    <Pressable
      onPressIn={() => {
        void Haptics.selectionAsync();
      }}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${liftDisplayName(lift)} progress`}
      hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
      testID={`lift-page-title-${lift}`}
      style={pressableStyle}
    >
      {titleNode}
    </Pressable>
  );
}
