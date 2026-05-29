import { LedgerRow, LedgerRowLabel } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { Text } from '@/design/primitives/Text';

export type DangerZoneSectionProps = {
  onReset: () => void;
  onRollback: () => void;
};

export function DangerZoneSection({ onReset, onRollback }: DangerZoneSectionProps) {
  return (
    <LedgerSection title="Danger zone">
      <LedgerRow first onPress={onRollback} testID="rollback-lift-button">
        <LedgerRowLabel
          primary="Roll back a lift"
          secondary="delete last N sessions · revert cycle position"
        />
        <Text variant="mono" weight="semibold" size={13} color="ink3">
          ›
        </Text>
      </LedgerRow>
      <LedgerRow onPress={onReset} testID="reset-everything-button">
        <LedgerRowLabel
          primary="Reset everything"
          secondary="wipes all data · returns to onboarding"
        />
        <Text variant="mono" weight="semibold" size={13} color="ink3">
          ›
        </Text>
      </LedgerRow>
    </LedgerSection>
  );
}
