import { LedgerRow, LedgerRowLabel } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle } from 'react-native';

export type DangerZoneSectionProps = {
  onReset: () => void;
};

export function DangerZoneSection({ onReset }: DangerZoneSectionProps) {
  const { colors, type } = useTheme();
  const chevronStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 13,
    color: colors.ink3,
  };
  return (
    <LedgerSection title="Danger zone">
      <LedgerRow first onPress={onReset} testID="reset-everything-button">
        <LedgerRowLabel
          primary="Reset everything"
          secondary="wipes all data · returns to onboarding"
        />
        <RNText style={chevronStyle}>›</RNText>
      </LedgerRow>
    </LedgerSection>
  );
}
