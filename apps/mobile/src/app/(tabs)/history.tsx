import { useTheme } from '@/design/theme';
import { Text, View } from 'react-native';

export default function HistoryScreen() {
  const { colors, type } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.ink0, fontFamily: `${type.sans}-Bold`, fontSize: 28 }}>
        History
      </Text>
    </View>
  );
}
