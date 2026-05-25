import { type ReactNode, useMemo } from 'react';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * One row of the Progress grid: a leading `C7` cycle label, 4 day cells,
 * and a trailing e1RM cell. This primitive owns the chrome (label width,
 * border-l between cells, outer border) and delegates the cell visuals
 * to its children — pass {@link ProgressGridCell} + {@link E1rmCell}
 * children, in left-to-right order.
 *
 * The chrome matches the PWA `CycleStrip`'s vocabulary: outer
 * `lineStrong` border, hairline `line` between cells.
 */
export type ProgressGridRowProps = {
  /** Cycle number rendered as `C{n}` to the left of the row. */
  cycle: number;
  /** Children should be: 4 day cells + 1 e1RM cell, in that order. */
  children: ReactNode;
  /** Optional caps eyebrow rendered above the cycle number (e.g. `CURRENT`). */
  eyebrow?: string;
  testID?: string;
};

const ROW_HEIGHT = 56;
const LABEL_WIDTH = 32;
const EYEBROW_WIDTH = 60;

export function ProgressGridRow({ cycle, children, eyebrow, testID }: ProgressGridRowProps) {
  const { colors, type, spacing } = useTheme();

  // Inter-cell hairline rules — applied to each child as a left border via
  // a wrapping View. Children pass through unmodified.
  const wrappedChildren = useMemo(() => {
    const arr: ReactNode[] = [];
    const items = Array.isArray(children) ? children : [children];
    items.forEach((child, idx) => {
      arr.push(
        <View
          key={`gc-${idx}-${cycle}`}
          style={{
            flex: idx === items.length - 1 ? 0.8 : 1,
            borderLeftWidth: idx === 0 ? 0 : 1,
            borderLeftColor: colors.line,
          }}
        >
          {child}
        </View>,
      );
    });
    return arr;
  }, [children, cycle, colors.line]);

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ROW_HEIGHT,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderTopWidth: 0,
  };

  const labelWrap: ViewStyle = {
    width: LABEL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    height: ROW_HEIGHT,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  };

  const labelStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 12,
    color: colors.ink2,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  const eyebrowStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    color: colors.ink3,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    marginRight: spacing.xs,
  };

  return (
    <View testID={testID} style={rowStyle}>
      {eyebrow ? (
        <View style={{ width: EYEBROW_WIDTH, alignItems: 'flex-end', paddingRight: spacing.xs }}>
          <RNText style={eyebrowStyle}>{eyebrow}</RNText>
        </View>
      ) : null}
      <View style={labelWrap}>
        <RNText style={labelStyle}>{`C${cycle}`}</RNText>
      </View>
      {wrappedChildren}
    </View>
  );
}

export const PROGRESS_GRID_ROW_HEIGHT = ROW_HEIGHT;
