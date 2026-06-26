import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
import { View } from 'react-native';

// Pre-formatted strings are rendered as-is so callers can compact wide values before they reach the UI.
export type AchievementStatProps = {
  label: string;
  value: number | string;
  testID?: string;
};

export function AchievementStat({ label, value, testID }: AchievementStatProps) {
  return (
    <View>
      <Heading size="s" numeric {...(testID !== undefined ? { testID } : {})}>
        {value}
      </Heading>
      <CapsLabel size="xs" color="ink3" style={{ marginTop: 4 }}>
        {label}
      </CapsLabel>
    </View>
  );
}
