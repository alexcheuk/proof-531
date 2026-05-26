import { Pressable, Text as RNText, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * Single Progress-grid cell. Four visual variants matching the canonical
 * design (see `_workspace/00_input/canonical-progress-v3.jsx`):
 *
 *   - `past`  — completed day; ink-filled (bg `ink0`, fg `bg0`). Shows
 *               weight (display 17) on top + `× N` (mono 9, .78 alpha) below.
 *   - `outlined` — most-recent completed day; same fill as `past`, plus a
 *               2-px ink outline INSET (rendered with stacked borders so
 *               outer dimensions stay aligned with neighboring cells).
 *   - `now`   — current week's upcoming day; paper bg, caps "now" eyebrow
 *               on top + display 15 weight below.
 *   - `future` — projected day; paper bg, mono 13 weight only, `ink3` color.
 *
 * Marker (`✓` / `─`) replaces the second-line content on deload cells.
 *
 * Renders as Pressable when `onPress` is supplied (past cells tap into
 * SessionComplete); otherwise as a plain View so VoiceOver does not
 * announce phantom buttons.
 */

export type ProgressGridCellVariant = 'past' | 'outlined' | 'now' | 'future';

export type ProgressGridCellProps = {
  variant: ProgressGridCellVariant;
  /** Display-unit weight; rendered as the primary number. */
  weight: number;
  /** AMRAP/working reps. Pass null for deload variants or future cells. */
  reps?: number | null;
  /** Deload glyph (✓ for done deload, ─ for projected deload). */
  marker?: '✓' | '─' | null;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

const CELL_HEIGHT = 64;

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

  const isPast = variant === 'past';
  const isOutlined = variant === 'outlined';
  const isNow = variant === 'now';
  const isFuture = variant === 'future';
  const filled = isPast || isOutlined;

  const containerBase: ViewStyle = {
    position: 'relative',
    flex: 1,
    minHeight: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 6,
    backgroundColor: filled ? colors.ink0 : 'transparent',
  };

  const weightColor = filled ? colors.bg0 : isFuture ? colors.ink3 : colors.ink0;
  const secondaryColor = filled ? colors.paperMuted : isFuture ? colors.ink3 : colors.ink2;

  const renderPastOrOutlined = () => (
    <>
      <RNText
        style={{
          fontFamily: `${type.sans}-Bold`,
          fontSize: 17,
          color: weightColor,
          letterSpacing: -0.51,
          lineHeight: 17,
          fontVariant: ['tabular-nums', 'lining-nums'],
        }}
      >
        {weight > 0 ? String(weight) : '·'}
      </RNText>
      <RNText
        style={{
          fontFamily: `${type.mono}-SemiBold`,
          fontSize: 9,
          color: secondaryColor,
          letterSpacing: 0.36,
          marginTop: 3,
          fontVariant: ['tabular-nums', 'lining-nums'],
        }}
      >
        {marker ? marker : typeof reps === 'number' && reps > 0 ? `× ${reps}` : ''}
      </RNText>
    </>
  );

  const renderNow = () => (
    <>
      <RNText
        style={{
          fontFamily: `${type.mono}-Bold`,
          fontSize: 8,
          color: colors.ink2,
          letterSpacing: 1.92,
          textTransform: 'uppercase',
        }}
      >
        now
      </RNText>
      <RNText
        style={{
          fontFamily: `${type.sans}-SemiBold`,
          fontSize: 15,
          color: colors.ink0,
          letterSpacing: -0.375,
          lineHeight: 15,
          marginTop: 3,
          fontVariant: ['tabular-nums', 'lining-nums'],
        }}
      >
        {weight > 0 ? String(weight) : '·'}
      </RNText>
    </>
  );

  const renderFuture = () => (
    <RNText
      style={{
        fontFamily: `${type.mono}-Medium`,
        fontSize: 13,
        color: colors.ink3,
        letterSpacing: 0.26,
        fontVariant: ['tabular-nums', 'lining-nums'],
      }}
    >
      {weight > 0 ? String(weight) : '·'}
    </RNText>
  );

  const body = isFuture ? renderFuture() : isNow ? renderNow() : renderPastOrOutlined();

  // Outline overlay for the "last completed" cell. Rendered as an absolutely
  // positioned 2-px border so it sits on top of the fill without changing
  // the cell's outer dimensions (which would shift adjacent columns).
  const outlineOverlay = isOutlined ? (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 2,
        borderColor: colors.ink0,
      }}
    />
  ) : null;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
        style={containerBase}
      >
        {body}
        {outlineOverlay}
      </Pressable>
    );
  }
  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      style={containerBase}
    >
      {body}
      {outlineOverlay}
    </View>
  );
}

export const PROGRESS_GRID_CELL_HEIGHT = CELL_HEIGHT;
