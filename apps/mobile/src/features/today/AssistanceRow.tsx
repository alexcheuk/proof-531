import { Caps } from '@/design/primitives/Caps';
import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
import { View } from 'react-native';

export type AssistanceItem = {
  name: string;
  category: 'push' | 'pull' | 'legs' | 'core';
  sets: number;
  reps: number | string;
};

export type AssistanceRowProps = {
  item: AssistanceItem;
  compact?: boolean;
};

const CATEGORY_COLOR: Record<AssistanceItem['category'], string> = {
  push: colors.hot,
  pull: colors.lime,
  legs: colors.ice,
  core: colors.amber,
};

/**
 * Accessory exercise row used by `TodayData`'s assistance section.
 *
 * Behavioral source: `design-reference/screens-main.jsx` `AssistanceRow`
 * (line 604) and `ASSISTANCE_COLOR` (line 637).
 */
export function AssistanceRow({ item, compact }: AssistanceRowProps) {
  return (
    <View
      testID={`assistance-row-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: shape.rSm,
        paddingVertical: compact ? shape.rXs : shape.rSm,
        paddingHorizontal: shape.rMd,
        backgroundColor: colors.bg1,
        borderRadius: shape.rSm,
      }}
    >
      <View
        style={{
          width: shape.rSm,
          height: shape.rSm,
          borderRadius: shape.rPill,
          backgroundColor: CATEGORY_COLOR[item.category],
        }}
      />
      <Text variant="small" tone="ink1" style={{ flex: 1 }}>
        {item.name}
      </Text>
      <Caps>{`${item.sets} × ${item.reps}`}</Caps>
    </View>
  );
}

export default AssistanceRow;
