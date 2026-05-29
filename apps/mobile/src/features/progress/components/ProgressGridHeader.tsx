import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

// Column layout must mirror ProgressGridRow: 34 px label spacer + 4 × flex 1 day cells + 54 px TM cell.
export function ProgressGridHeader({ unitGlyph }: { unitGlyph: 'lb' | 'kg' }) {
  const { colors } = useTheme();
  const dayLabels: Array<{ label: string; scheme: string }> = [
    { label: 'D1', scheme: '5+' },
    { label: 'D2', scheme: '3+' },
    { label: 'D3', scheme: '1+' },
    // Day 4 was the deload (`del`); the TM Test replaces it (`TM`).
    { label: 'D4', scheme: 'TM' },
  ];

  const headerCell = (
    key: string,
    label: string,
    sub: string | null,
    flex: number | undefined,
    width: number | undefined,
    withLeftRule: boolean,
    withLeftStrongRule: boolean,
  ) => (
    <View
      key={key}
      style={{
        flex,
        width,
        paddingVertical: 8,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: 36,
        borderLeftWidth: withLeftRule || withLeftStrongRule ? 1 : 0,
        borderLeftColor: withLeftStrongRule ? colors.ink0 : colors.line,
      }}
    >
      <CapsLabel weight="bold" color="ink0" style={{ letterSpacing: 1.8 }}>
        {label}
      </CapsLabel>
      {sub ? (
        <Text
          variant="mono"
          weight="medium"
          size={8}
          color="ink3"
          style={{ textTransform: 'uppercase', letterSpacing: 1.44 }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );

  const wrap: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.ink0,
  };

  return (
    <View style={wrap}>
      <View
        style={{
          width: 34,
          borderRightWidth: 1,
          borderRightColor: colors.ink0,
        }}
      />
      {dayLabels.map((d, i) => headerCell(d.label, d.label, d.scheme, 1, undefined, i > 0, false))}
      {headerCell('tm', '→ TM', unitGlyph, undefined, 54, false, true)}
    </View>
  );
}
