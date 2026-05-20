import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens';
import { StyleSheet, View } from 'react-native';

export default function HistoryTab() {
  return (
    <View style={styles.container}>
      <Text variant="title">History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
