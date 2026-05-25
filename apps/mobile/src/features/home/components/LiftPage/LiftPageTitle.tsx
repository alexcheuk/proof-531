import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import * as Haptics from 'expo-haptics';
import { Pressable, type ViewStyle } from 'react-native';

export type LiftPageTitleProps = {
  lift: Lift;
  /**
   * Tap handler. When supplied, the headline becomes a Pressable that
   * fires a selection haptic on press-in. Used by TODAY to route into
   * the Progress screen for this lift. Omit to render the headline as
   * non-interactive Text (preserves the original behavior for screens
   * that don't yet integrate the Progress entry point).
   */
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

/**
 * The giant lift-name headline (e.g. "Squat.") with the amber-accent
 * period. Sized to match the PWA's hero typography on a LiftPage.
 *
 * Wrapped in a Pressable when `onPress` is supplied so the lifter can
 * tap the headline to open the Progress screen for this lift (per spec
 * decision 6). Press-in fires `Haptics.selectionAsync()`. Hit-slop adds
 * vertical padding so the effective tap target clears 44 pt.
 */
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
