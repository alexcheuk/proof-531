import { Caps } from '@/design/primitives/Caps';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { Pressable, View } from 'react-native';

export type SetRowProps = {
  index: number;
  weight: number;
  reps: number;
  amrap: boolean;
  pct: number;
  unit: 'lbs' | 'kg';
  done?: boolean;
  next?: boolean;
  onPress?: () => void;
};

/**
 * Single-line tabular set row used by `TodayData`. Compact alternative to
 * `SetCard`.
 *
 * Behavioral source: `design-reference/screens-main.jsx` `SetRow` (line 554).
 */
export function SetRow({
  index,
  weight,
  reps,
  amrap,
  pct,
  unit,
  done,
  next,
  onPress,
}: SetRowProps) {
  const testID = next ? 'set-row-next' : done ? `set-row-done-${index}` : `set-row-${index}`;
  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: shape.rMd,
        paddingVertical: shape.rSm,
        paddingHorizontal: shape.rMd,
        opacity: done ? 0.6 : 1,
        backgroundColor: next ? colors.bg2 : colors.bg1,
        borderRadius: shape.rSm,
      }}
    >
      <Caps>{`#${index + 1}`}</Caps>
      <Caps>{`${Math.round(pct * 100)}%`}</Caps>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: shape.rSm }}>
        <WeightNum value={weight} size="sm" />
        <Text variant="small" tone="ink2">{`× ${reps}${amrap ? '+' : ''} ${unit}`}</Text>
      </View>
    </View>
  );
  if (!onPress) return <View testID={testID}>{inner}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" testID={testID}>
      {inner}
    </Pressable>
  );
}

export default SetRow;
