import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export function Colophon() {
  const { colors, layout, type } = useTheme();
  const wrap: ViewStyle = {
    paddingTop: 36,
    paddingHorizontal: layout.gutter,
    alignItems: 'center',
  };
  const label: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 2.88,
    textTransform: 'uppercase',
    color: colors.ink3,
    textAlign: 'center',
  };
  return (
    <View style={wrap}>
      <RNText style={label}>— end of register —</RNText>
    </View>
  );
}
