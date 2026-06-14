import { LedgerRow, LedgerRowLabel } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { Text } from '@/design/primitives/Text';

export type BackupSectionProps = {
  onExport: () => void;
  onOpenRestore: () => void;
};

export function BackupSection({ onExport, onOpenRestore }: BackupSectionProps) {
  return (
    <LedgerSection title="Backup & Restore">
      <LedgerRow
        first
        onPress={onExport}
        testID="export-backup-button"
        accessibilityLabel="Export backup. Save all progress as a file you can keep."
      >
        <LedgerRowLabel
          primary="Export backup"
          secondary="save all progress as a file you can keep"
        />
        <Text variant="mono" weight="semibold" size={13} color="ink3">
          ›
        </Text>
      </LedgerRow>
      <LedgerRow
        onPress={onOpenRestore}
        testID="restore-backup-button"
        accessibilityLabel="Restore backup. Overwrite current data from a saved backup."
      >
        <LedgerRowLabel
          primary="Restore backup"
          secondary="overwrite current data from a saved backup"
        />
        <Text variant="mono" weight="semibold" size={13} color="ink3">
          ›
        </Text>
      </LedgerRow>
    </LedgerSection>
  );
}
