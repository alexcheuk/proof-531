import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
import { View } from 'react-native';

/**
 * A label + numeric/text value pair used inside the History tab's
 * `AchievementStrip`. Three of these line up across the top of the card.
 *
 * Pre-formatted strings (e.g. `12.4k lb`) are rendered as-is so callers can
 * compact wide values before they reach the UI.
 */
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
