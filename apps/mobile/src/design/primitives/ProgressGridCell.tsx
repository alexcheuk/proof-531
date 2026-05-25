import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Single Progress-grid cell. Three visual variants matching the spec's
 * `▓` / `┃` / `·` vocabulary:
 *
 *   - `filled` (`▓`)   — past completed day; ink-filled with inverted text.
 *   - `outlined` (`┃`) — the single "you are here" day; 2-px ink border,
 *                       paper background.
 *   - `ghosted` (`·`)  — future / projected day; dashed ink-line border,
 *                       muted ink text.
 *
 * Renders as a Pressable when `onPress` is supplied (past cells routing
 * to SessionComplete), otherwise as a plain View (future cells must not
 * announce a phantom VoiceOver button per spec accessibility section).
 *
 * Marker (`✓` / `─` / null) replaces the second-line `×N` reps for the
 * deload column; pass `marker` instead of `reps` for deload cells.
 *
 * The dashed-border treatment uses `borderStyle: 'dashed'`. RN supports
 * this with platform quirks (Android may render unevenly under some
 * driver/skia combinations); spec accepts the risk and proposes SVG
 * fallback only if QA flags it.
 */

export type ProgressGridCellVariant = 'filled' | 'outlined' | 'ghosted';

export type ProgressGridCellProps = {
  variant: ProgressGridCellVariant;
  /** Display-unit weight; rendered as the first line. */
  weight: number;
  /** Reps for AMRAP/working cells. Pass null/undefined for deload variants. */
  reps?: number | null;
  /** Deload marker glyph replacing the reps line. */
  marker?: '✓' | '─' | null;
  /** Tap target — typically navigates to SessionComplete. Omit for non-interactive cells. */
  onPress?: () => void;
  /** Accessibility label override (spec defines per-cell content). */
  accessibilityLabel?: string;
  testID?: string;
};

const CELL_HEIGHT = 56;
const PRIMARY_FONT_SIZE = 15;
const SECONDARY_FONT_SIZE = 11;
const OUTLINE_BORDER = 2;
const DASHED_BORDER = 1;

export function ProgressGridCell({
  variant,
  weight,
  reps,
  marker,
  onPress,
  accessibilityLabel,
  testID,
}: ProgressGridCellProps) {
  const { colors, type } = useTheme();

  const isFilled = variant === 'filled';
  const isOutlined = variant === 'outlined';
  const isGhosted = variant === 'ghosted';

  const containerBase: ViewStyle = {
    flex: 1,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const filledStyle: ViewStyle = {
    backgroundColor: colors.ink0,
  };

  const outlinedStyle: ViewStyle = {
    backgroundColor: colors.bg0,
    borderWidth: OUTLINE_BORDER,
    borderColor: colors.ink0,
  };

  const ghostedStyle: ViewStyle = {
    backgroundColor: colors.bg0,
    borderWidth: DASHED_BORDER,
    borderStyle: 'dashed',
    borderColor: colors.line,
  };

  const variantStyle: ViewStyle = isFilled
    ? filledStyle
    : isOutlined
      ? outlinedStyle
      : ghostedStyle;

  const weightColor = isFilled ? colors.bg0 : isGhosted ? colors.ink3 : colors.ink0;
  const secondaryColor = isFilled ? colors.paperMuted : isGhosted ? colors.ink3 : colors.ink2;

  const weightStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: PRIMARY_FONT_SIZE,
    color: weightColor,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const secondaryStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: SECONDARY_FONT_SIZE,
    color: secondaryColor,
    marginTop: 2,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const renderBody = () => (
    <>
      <RNText style={weightStyle}>{weight > 0 ? String(weight) : '·'}</RNText>
      {marker !== undefined && marker !== null ? (
        <RNText style={secondaryStyle}>{marker}</RNText>
      ) : typeof reps === 'number' && reps > 0 ? (
        <RNText style={secondaryStyle}>×{reps}</RNText>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
        style={[containerBase, variantStyle]}
      >
        {renderBody()}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      style={[containerBase, variantStyle]}
    >
      {renderBody()}
    </View>
  );
}
