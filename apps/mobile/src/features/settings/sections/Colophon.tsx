import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';

export function Colophon() {
  const { layout } = useTheme();
  const wrap: ViewStyle = {
    paddingTop: 36,
    paddingHorizontal: layout.gutter,
    alignItems: 'center',
  };
  return (
    <View style={wrap}>
      <CapsLabel size="xs" color="ink3" style={{ textAlign: 'center', letterSpacing: 2.88 }}>
        - end of register -
      </CapsLabel>
    </View>
  );
}
