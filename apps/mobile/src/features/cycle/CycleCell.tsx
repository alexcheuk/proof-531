import { Text } from '@/design/primitives/Text';
import { colors, shape, type } from '@/design/tokens';
import { Pressable, View } from 'react-native';

export type CycleCellState = 'current' | 'done' | 'future' | 'deload';

export type CycleCellProps = {
  week: 1 | 2 | 3 | 4;
  liftId: string;
  liftLabel: string;
  trainingMax: number;
  unit: 'lbs' | 'kg';
  state: CycleCellState;
  onPress?: () => void;
};

const BG: Record<CycleCellState, string> = {
  current: colors.hot,
  done: colors.bg2,
  deload: colors.hotSoft,
  future: colors.bg1,
};

export function CycleCell({
  week,
  liftId,
  liftLabel,
  trainingMax,
  unit,
  state,
  onPress,
}: CycleCellProps) {
  const initial = liftLabel.charAt(0).toUpperCase();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Week ${week} ${liftLabel} ${trainingMax} ${unit} ${state}`}
      onPress={onPress}
      testID={`cycle-cell-${week}-${liftId}`}
      style={{
        aspectRatio: 1,
        backgroundColor: BG[state],
        borderRadius: shape.rSm,
        padding: shape.rSm,
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ fontFamily: type.mono, fontWeight: '700' }} tone="ink0">
        {initial}
      </Text>
      <Text
        variant="small"
        tone={state === 'current' ? 'ink0' : 'ink2'}
        style={{ fontFamily: type.mono }}
      >
        {trainingMax}
      </Text>
      {state === 'done' ? (
        <View
          testID={`cycle-cell-done-${week}-${liftId}`}
          style={{ position: 'absolute', top: shape.rXs, right: shape.rXs }}
        >
          <Text variant="caption" tone="ink2">
            ✓
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default CycleCell;
