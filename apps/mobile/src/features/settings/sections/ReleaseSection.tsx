// Hidden when running outside expo-updates (isEmbeddedLaunch + no channel/updateId) — the
// section would just render dashes and confuse non-OTA testers.
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { formatRelativeTime } from '@/domain/relativeTime';
import { useOtaStatus } from '@/features/shared/useOtaStatus';

export function ReleaseSection() {
  const ota = useOtaStatus();

  // Nothing meaningful to show when running outside expo-updates' purview.
  if (!ota.channel && ota.isEmbeddedLaunch && !ota.updateId) return null;

  const sourceLabel = ota.isEmbeddedLaunch ? 'Embedded' : 'OTA';
  const sourceSub = ota.isEmbeddedLaunch ? 'shipped in build' : 'over-the-air';

  const idShort = ota.updateId ? shortenId(ota.updateId) : '—';
  const released = ota.createdAt ? formatRelativeTime(ota.createdAt.getTime()) : '—';

  const checkValue = ota.isChecking
    ? 'Checking…'
    : ota.isDownloading
      ? 'Downloading…'
      : ota.isUpdatePending
        ? 'Ready · restart'
        : ota.isUpdateAvailable
          ? 'Available'
          : 'Check now';

  const checkSub = ota.lastChecked
    ? `last ${formatRelativeTime(ota.lastChecked.getTime())}`
    : undefined;

  const handlePress = () => {
    if (ota.isUpdatePending) {
      void ota.applyNow();
      return;
    }
    if (ota.isUpdateAvailable && !ota.isDownloading) {
      void ota.fetchNow();
      return;
    }
    void ota.checkNow();
  };

  return (
    <LedgerSection title="Release" {...(ota.channel ? { hint: ota.channel } : {})}>
      <LedgerRow first>
        <LedgerRowLabel primary="Source" secondary={sourceSub} />
        <LedgerRowValue value={sourceLabel} />
      </LedgerRow>
      <LedgerRow>
        <LedgerRowLabel primary="Update" secondary="bundle id" />
        <LedgerRowValue value={idShort} numeric />
      </LedgerRow>
      <LedgerRow>
        <LedgerRowLabel primary="Released" secondary="bundle published" />
        <LedgerRowValue value={released} />
      </LedgerRow>
      <LedgerRow
        onPress={handlePress}
        testID="release-check-row"
        accessibilityLabel="Check for over-the-air update"
      >
        <LedgerRowLabel primary="Check for update" {...(checkSub ? { secondary: checkSub } : {})} />
        <LedgerRowValue value={checkValue} tone="muted" />
      </LedgerRow>
    </LedgerSection>
  );
}

// First eight chars of the UUID — enough to disambiguate consecutive
// publishes, short enough to fit in the value column.
function shortenId(id: string): string {
  return id.slice(0, 8);
}
