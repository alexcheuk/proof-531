import { Children, type ReactNode } from 'react';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/**
 * One row of the Progress grid: zero-padded cycle label (`C07`), 4 day
 * cells, trailing TM cell. Row chrome (borders, label tile, current-cycle
 * tint) is owned here; cell visuals are children.
 *
 * Layout: identical to {@link ProgressGridHeaderShell} — a fixed-width label
 * column on the left (34 px), 4 day cells each `flex: 1`, and a fixed-width
 * TM column on the right (54 px). The shared widths are exported so the
 * header in the screen file can pin to the same numbers.
 *
 * Current-cycle row:
 *   - subtle row tint (`paperMuted`) across the body
 *   - cycle-label cell INVERTED (bg `ink0`, fg `bg0`)
 *
 * Past-cycle row:    cycle-label color `ink0`
 * Future-cycle row:  cycle-label color `ink3`
 */
export type ProgressGridRowProps = {
  cycle: number;
  /** 4 day cell children + 1 TM cell child (5 children, in that order). */
  children: ReactNode;
  /** Row state controls cycle-label color + current-cycle tint. */
  state: 'past' | 'current' | 'future';
  testID?: string;
};

const ROW_HEIGHT = 64;
const LABEL_WIDTH = 34;
const TM_WIDTH = 54;

export function ProgressGridRow({ cycle, children, state, testID }: ProgressGridRowProps) {
  const { colors, type } = useTheme();
  // Flatten across mixed `{array}` + sibling children. Without this, JSX like
  // `<Row>{cells.map(...)}<TmCell/></Row>` arrives as `[Array<Cell>, TmCell]`
  // and the per-day wrappers collapse 4 cells into a single column.
  const items = Children.toArray(children);

  const isCurrent = state === 'current';

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: isCurrent ? colors.paperMuted : 'transparent',
  };

  const labelCellStyle: ViewStyle = {
    width: LABEL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.ink0,
    backgroundColor: isCurrent ? colors.ink0 : 'transparent',
  };

  const labelTextStyle: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 10,
    color: isCurrent ? colors.bg0 : state === 'past' ? colors.ink0 : colors.ink3,
    letterSpacing: 0.4,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };

  return (
    <View testID={testID} style={rowStyle}>
      <View style={labelCellStyle}>
        <RNText style={labelTextStyle}>{`C${String(cycle).padStart(2, '0')}`}</RNText>
      </View>
      {items.slice(0, 4).map((child, idx) => (
        <View
          key={`day-${idx}-${cycle}`}
          style={{
            flex: 1,
            borderLeftWidth: 1,
            borderLeftColor: colors.line,
          }}
        >
          {child}
        </View>
      ))}
      <View
        style={{
          width: TM_WIDTH,
          borderLeftWidth: 1,
          borderLeftColor: colors.ink0,
        }}
      >
        {items[4]}
      </View>
    </View>
  );
}

export const PROGRESS_GRID_ROW_HEIGHT = ROW_HEIGHT;
export const PROGRESS_GRID_LABEL_WIDTH = LABEL_WIDTH;
export const PROGRESS_GRID_TM_WIDTH = TM_WIDTH;
