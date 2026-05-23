import { useTheme } from '@/design/theme';
import { Text, View } from 'react-native';

export default function TodayScreen() {
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
        Today
      </Text>
    </View>
  );
}
