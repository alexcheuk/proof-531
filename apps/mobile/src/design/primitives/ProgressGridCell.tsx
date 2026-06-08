import { Pressable, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import type { ColorToken } from '../tokens';
import { Text } from './Text';

export type ProgressGridCellVariant = 'past' | 'outlined' | 'now' | 'future';

export type ProgressGridCellProps = {
  variant: ProgressGridCellVariant;
  /** Display-unit weight; rendered as the primary number. */
  weight: number;
  /** AMRAP/working reps. Pass null for deload variants or future cells. */
  reps?: number | null;
  /**
   * Secondary glyph that replaces the reps line. The set widens by one
   * triplet on Week 4 TM-test cells:
   *
   *   - `✓` — legacy week-4 deload completion (kept for forward-only history).
   *   - `─` — projected future deload-style cell.
   *   - `↑` — TM test passed strong (≥5 reps, increment band).
   *   - `=` — TM test held (3–4 reps, hold band).
   *   - `↓` — TM test reset (0–2 reps, reset band).
   */
  marker?: '✓' | '↑' | '↓' | '=' | '─' | null;
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
  const { colors } = useTheme();

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

  // Resolved ColorToken keys for weight and secondary text.
  // Filled cells (past/outlined) use bg0 (paper white) against the ink-0 fill.
  // Future cells use ink3 (muted). Now/present cells use ink0 (primary).
  const weightColorToken: ColorToken = filled ? 'bg0' : isFuture ? 'ink3' : 'ink0';
  // Brighten the rep count on filled cells from paperMuted → bg0 (full
  // paper white) so the "× N" reads clearly against ink-0 — and bump to
  // fontSize 10 so it pulls its weight next to the bolded weight number.
  const secondaryColorToken: ColorToken = filled ? 'bg0' : isFuture ? 'ink3' : 'ink2';

  const renderPastOrOutlined = () => (
    <>
      <Text
        variant="sans"
        weight="bold"
        size={17}
        color={weightColorToken}
        numeric
        style={{ letterSpacing: -0.51, lineHeight: 17 }}
      >
        {weight > 0 ? String(weight) : '·'}
      </Text>
      <Text
        variant="mono"
        weight="semibold"
        size={10}
        color={secondaryColorToken}
        numeric
        style={{ letterSpacing: 0.36, marginTop: 3 }}
      >
        {(() => {
          const hasReps = typeof reps === 'number' && reps > 0;
          // TM-test (Day 4) cells carry BOTH a direction marker and a rep
          // count, so they read e.g. "↑ × 5": the lifter sees how many reps
          // they hit and whether the TM moves. AMRAP cells show "× N";
          // deload/projected cells show just the marker.
          if (marker && hasReps) return `${marker} × ${reps}`;
          if (marker) return marker;
          return hasReps ? `× ${reps}` : '';
        })()}
      </Text>
    </>
  );

  const renderNow = () => (
    <>
      <Text
        variant="mono"
        weight="bold"
        size={8}
        color="ink2"
        style={{ letterSpacing: 1.92, textTransform: 'uppercase' }}
      >
        next
      </Text>
      <Text
        variant="sans"
        weight="semibold"
        size={15}
        color="ink0"
        numeric
        style={{ letterSpacing: -0.375, lineHeight: 15, marginTop: 3 }}
      >
        {weight > 0 ? String(weight) : '·'}
      </Text>
    </>
  );

  const renderFuture = () => (
    <Text
      variant="mono"
      weight="medium"
      size={13}
      color="ink3"
      numeric
      style={{ letterSpacing: 0.26 }}
    >
      {weight > 0 ? String(weight) : '·'}
    </Text>
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

  // "NEXT" cell highlight: a 4-px amber accent border inset 2 px from
  // the cell's outer line. Amber is the project's lone accent color and
  // is reserved for "you are here" / wordmark dots — using it here gives
  // the next-session cell a clear visual lock without inventing a new
  // tint. Inset position keeps the cell geometry identical to neighbors.
  const nextRingOverlay = isNow ? (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 2,
        left: 2,
        right: 2,
        bottom: 2,
        borderWidth: 4,
        borderColor: colors.amber,
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
        {nextRingOverlay}
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
      {nextRingOverlay}
    </View>
  );
}

export const PROGRESS_GRID_CELL_HEIGHT = CELL_HEIGHT;
