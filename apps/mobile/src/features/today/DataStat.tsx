import { Caps } from '@/design/primitives/Caps';
import { Text } from '@/design/primitives/Text';
import { colors, shape, type } from '@/design/tokens';
import { View } from 'react-native';

export type DataStatProps = {
  label: string;
  value: string | number;
  sub?: string;
  mono?: boolean;
  testID?: string;
};

/**
 * Tiny stat tile used by `TodayData`'s top stats strip. A label (Caps), a big
 * value, and an optional sub-label.
 *
 * Behavioral source: `design-reference/screens-main.jsx` `DataStat`
 * (line 532).
 */
export function DataStat({ label, value, sub, mono, testID }: DataStatProps) {
  return (
    <View
      testID={testID}
      style={{
        flex: 1,
        gap: shape.rXs,
        padding: shape.rMd,
        backgroundColor: colors.bg1,
        borderRadius: shape.rSm,
      }}
    >
      <Caps>{label}</Caps>
      <Text variant="title" style={mono ? { fontFamily: type.mono } : undefined}>
        {String(value)}
      </Text>
      {sub ? <Caps>{sub}</Caps> : null}
    </View>
  );
}

export default DataStat;
