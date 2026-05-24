import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type CycleGridProps = {
  cycle: number;
  completedThisCycle: number;
  sessionsInCycle: number;
};

const WEEK_LABELS = ['W1', 'W2', 'W3', 'W4'] as const;

/**
 * Cycle № NN header + visual 16-cell (or 4n-cell) grid showing position
 * within the current cycle. The just-filed cell is double-bordered.
 *
 * The visual grid (frame + cells + week labels) is the standalone
 * `CycleGridFrame` sibling — this composition just adds the
 * `Cycle № NN · N of M` header row.
 */
export function CycleGrid({ cycle, completedThisCycle, sessionsInCycle }: CycleGridProps) {
  const { colors, layout, type } = useTheme();

  const headerLabel: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };
  const headerHint: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  return (
    <View style={{ paddingTop: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 8, paddingHorizontal: layout.gutter }}>
        <RNText style={headerLabel}>{`Cycle № ${String(cycle ?? 1).padStart(2, '0')}`}</RNText>
        <RNText style={headerHint}>{`${completedThisCycle} of ${sessionsInCycle}`}</RNText>
      </Row>
      <CycleGridFrame completedThisCycle={completedThisCycle} sessionsInCycle={sessionsInCycle} />
    </View>
  );
}

export type CycleGridFrameProps = {
  completedThisCycle: number;
  sessionsInCycle: number;
  testID?: string;
};

/**
 * Standalone visual grid — frame + per-day cells + week-label row. Used by
 * SessionComplete (under the `CycleGrid` header) and by Settings (under
 * the `CycleProgressSection` row) to give the same visual treatment in
 * both surfaces.
 */
export function CycleGridFrame({
  completedThisCycle,
  sessionsInCycle,
  testID,
}: CycleGridFrameProps) {
  const { colors, type } = useTheme();

  const frame: ViewStyle = {
    marginHorizontal: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  };
  const weekLabel: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  return (
    <View style={frame}>
      <Row gap="xs" {...(testID !== undefined ? { testID } : { testID: 'cycle-grid' })}>
        {Array.from({ length: sessionsInCycle }).map((_, i) => (
          <CycleCell
            // biome-ignore lint/suspicious/noArrayIndexKey: positional grid cell
            key={`cell-${i}`}
            done={i < completedThisCycle}
            justNow={i === completedThisCycle - 1}
          />
        ))}
      </Row>
      <Row justify="space-between" style={{ marginTop: 10 }}>
        {WEEK_LABELS.map((w) => (
          <RNText key={w} style={weekLabel}>
            {w}
          </RNText>
        ))}
      </Row>
    </View>
  );
}

function CycleCell({ done, justNow }: { done: boolean; justNow: boolean }) {
  const { colors } = useTheme();
  const base: ViewStyle = { flex: 1, height: 16 };
  const fill: ViewStyle = done
    ? { backgroundColor: colors.ink0 }
    : { borderWidth: 1, borderColor: colors.line };
  return (
    <View style={[base, fill, justNow ? { position: 'relative' } : null]} testID="cycle-cell">
      {justNow ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -3,
            left: -3,
            right: -3,
            bottom: -3,
            borderWidth: 1,
            borderColor: colors.ink0,
          }}
        />
      ) : null}
    </View>
  );
}
