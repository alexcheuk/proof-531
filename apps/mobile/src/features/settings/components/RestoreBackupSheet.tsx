// No red on the destructive restore  -  the e-ink theme aliases red → ink-0;
// copy and the filled CTA carry the weight. Validation runs fully before any DB
// write, so a malformed paste surfaces an inline message and never clears data.
import { PasteField } from '@/design/primitives/PasteField';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SheetLayout } from '@/design/primitives/SheetLayout';
import { Text } from '@/design/primitives/Text';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export type RestoreFailure = 'invalid-json' | 'wrong-shape' | 'unsupported-version';
export type RestoreResult = { ok: true } | { ok: false; reason: RestoreFailure };

export interface RestoreBackupSheetProps {
  open: boolean;
  onCancel: () => void;
  // The sheet owns the pasted text + inline status; the hook owns the DB write
  // + haptics and reports back the precise failure reason for the status line.
  onConfirm: (json: string) => Promise<RestoreResult>;
  pending?: boolean;
}

const STATUS_COPY: Record<RestoreFailure, string> = {
  'invalid-json': "That doesn't look like valid backup JSON.",
  'wrong-shape': 'This backup is missing required fields.',
  'unsupported-version':
    'This backup was made by a newer version of 531. Update the app to restore it.',
};

export function RestoreBackupSheet({
  open,
  onCancel,
  onConfirm,
  pending = false,
}: RestoreBackupSheetProps) {
  const [text, setText] = useState('');
  const [failure, setFailure] = useState<RestoreFailure | null>(null);

  // Clear the pasted text + status whenever the sheet closes so reopening
  // starts empty (matches the brief; mirrors the log-sheet cancel guard).
  useEffect(() => {
    if (!open) {
      setText('');
      setFailure(null);
    }
  }, [open]);

  const handleChange = useCallback((next: string) => {
    setText(next);
    setFailure(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (pending || text.trim().length === 0) return;
    const result = await onConfirm(text);
    if (!result.ok) {
      setFailure(result.reason);
      AccessibilityInfo.announceForAccessibility(STATUS_COPY[result.reason]);
    }
  }, [onConfirm, pending, text]);

  const statusLine = pending
    ? 'Restoring…'
    : failure
      ? STATUS_COPY[failure]
      : text.trim().length === 0
        ? 'Paste a backup to continue'
        : '';

  const disabled = pending || text.trim().length === 0;

  return (
    <SheetLayout
      open={open}
      onDismiss={onCancel}
      testID="restore-backup-sheet"
      snapPoints={['85%']}
      eyebrow="RESTORE"
      title="Restore from backup?"
      titleVariant="display"
      pending={pending}
      primary={
        <PrimaryPillButton
          testID="restore-confirm"
          onPress={() => void handleConfirm()}
          disabled={disabled}
          glyph="→"
          accessibilityLabel="Restore and overwrite all current data"
        >
          Restore & overwrite
        </PrimaryPillButton>
      }
      cancel={{
        label: 'Keep my data',
        onPress: onCancel,
        variant: 'outlined',
        testID: 'restore-cancel',
        accessibilityLabel: 'Keep my data',
      }}
    >
      <Text variant="sans" weight="regular" size={13} color="ink2" style={{ lineHeight: 19 }}>
        This replaces ALL your current data - training maxes, sessions, set logs, PRs, and goals -
        with the backup's contents. This can't be undone. Export a fresh backup first if you're not
        sure.
      </Text>

      <PasteField
        value={text}
        onChangeText={handleChange}
        placeholder="Paste your backup JSON here"
        editable={!pending}
        maxLines={14}
        accessibilityLabel="Backup JSON"
        accessibilityHint="Paste the JSON from a previously exported backup"
        testID="restore-paste-field"
      />

      {statusLine ? (
        <Text variant="mono" weight="regular" size={11} color={failure ? 'ink0' : 'ink2'}>
          {statusLine}
        </Text>
      ) : null}
    </SheetLayout>
  );
}
