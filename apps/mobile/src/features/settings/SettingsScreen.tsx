import { useScrolledPast } from '@/design/hooks/useScrolledPast';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { convertAndSnap } from '@/domain/units';
import { QueryShell } from '@/features/shared/QueryShell';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { ResetConfirmSheet } from './components/ResetConfirmSheet';
import { RestoreBackupSheet } from './components/RestoreBackupSheet';
import { RollbackLiftSheet } from './components/RollbackLiftSheet';
import { TmEditSheet } from './components/TmEditSheet';
import { type TmPreview, UnitMigrationSheet } from './components/UnitMigrationSheet';
import { useSettingsDialogs } from './hooks/useSettingsDialogs';
import { useSettingsScreenData } from './hooks/useSettingsScreenData';
import { AboutSection } from './sections/AboutSection';
import { ActiveLiftsSection } from './sections/ActiveLiftsSection';
import { BackupSection } from './sections/BackupSection';
import { Colophon } from './sections/Colophon';
import { CyclePrescriptionSection } from './sections/CyclePrescriptionSection';
import { DangerZoneSection } from './sections/DangerZoneSection';
import { LiveScreenLookSection } from './sections/LiveScreenLookSection';
import { PlateSetSection } from './sections/PlateSetSection';
import { ProgressionRulesSection } from './sections/ProgressionRulesSection';
import { ReleaseSection } from './sections/ReleaseSection';
import { RestAlarmSection } from './sections/RestAlarmSection';
import { RestTargetSection } from './sections/RestTargetSection';
import { TrainingMaxSection } from './sections/TrainingMaxSection';
import { UnitsSection } from './sections/UnitsSection';

export function SettingsScreen() {
  const { colors, spacing } = useTheme();
  const screenData = useSettingsScreenData();
  const { settings, tmsByLift, isLoading, isError, error, refetch } = screenData;
  const dialogs = useSettingsDialogs(settings?.storageUnit ?? 'lbs');
  const { scrolled, onScroll, scrollEventThrottle } = useScrolledPast();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  // Single early-return path: always render the Masthead so the page never
  // flashes a blank paper canvas. QueryShell handles loading/error; the
  // missing-settings tail (resolved query, no row) reads as "loading" so
  // the user sees a stable header instead of an empty page.
  if (isLoading || isError || !settings) {
    const query =
      !settings && !isLoading && !isError
        ? { isLoading: true, isError: false, error, refetch }
        : { isLoading, isError, error, refetch };
    return (
      <View style={containerStyle} testID="settings-loading">
        <StatusBar style="dark" />
        <Masthead rightSlot={<CapsLabel>settings</CapsLabel>} />
        <QueryShell query={query}>{null}</QueryShell>
      </View>
    );
  }

  const storageUnit = settings.storageUnit;
  const displayUnit = settings.displayUnit ?? storageUnit;
  const tmPreviews = buildTmPreviews(tmsByLift, dialogs.pendingStorage);

  return (
    <View style={containerStyle}>
      <StatusBar style="dark" />
      <Masthead rightSlot={<CapsLabel>settings</CapsLabel>} elevated={scrolled} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
        testID="settings-scroll"
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        <TitleBlock eyebrow="The dials" title="Settings." />

        <UnitsSection
          storageUnit={storageUnit}
          displayUnit={displayUnit}
          onStorageRequest={dialogs.requestStorageMigration}
        />

        <ActiveLiftsSection enabled={settings.enabledLifts} storageUnit={storageUnit} />

        <TrainingMaxSection
          settings={settings}
          tmsByLift={tmsByLift}
          onEdit={dialogs.openTmEditor}
        />

        <CyclePrescriptionSection />

        <ProgressionRulesSection storageUnit={storageUnit} />

        <PlateSetSection plateSet={settings.plateSet} />

        <RestTargetSection
          restTargetSeconds={settings.restTargetSeconds}
          bbbRestTargetSeconds={settings.bbbRestTargetSeconds}
        />

        <RestAlarmSection restAlarmSound={settings.restAlarmSound} />

        <LiveScreenLookSection inverted={settings.liveScreenInverted} />

        <AboutSection />

        <ReleaseSection />

        <BackupSection
          onExport={() => void dialogs.exportBackupNow()}
          onOpenRestore={dialogs.openRestore}
        />

        <DangerZoneSection onReset={dialogs.requestReset} onRollback={dialogs.openRollback} />

        <Colophon />
      </ScrollView>

      {dialogs.editingLift ? (
        <TmEditSheet
          lift={dialogs.editingLift}
          currentValue={tmsByLift?.[dialogs.editingLift]?.value ?? 0}
          storageUnit={tmsByLift?.[dialogs.editingLift]?.unit ?? storageUnit}
          displayUnit={displayUnit}
          onClose={dialogs.closeTmEditor}
        />
      ) : null}

      {dialogs.pendingStorage ? (
        <UnitMigrationSheet
          open
          currentUnit={storageUnit}
          targetUnit={dialogs.pendingStorage}
          tmPreviews={tmPreviews}
          pending={dialogs.migrating}
          onCancel={dialogs.cancelStorageMigration}
          onConfirm={() => void dialogs.confirmStorageMigration()}
        />
      ) : null}

      {dialogs.confirmingReset ? (
        <ResetConfirmSheet
          open
          pending={dialogs.resetting}
          onCancel={dialogs.cancelReset}
          onConfirm={() => void dialogs.confirmReset()}
        />
      ) : null}

      {dialogs.restoreOpen ? (
        <RestoreBackupSheet
          open
          pending={dialogs.restoring}
          onCancel={dialogs.closeRestore}
          onConfirm={dialogs.confirmRestore}
        />
      ) : null}

      {dialogs.rollbackOpen ? (
        <RollbackLiftSheet
          open
          enabledLifts={settings.enabledLifts}
          pending={dialogs.rollingBack}
          onClose={dialogs.closeRollback}
          onConfirm={(lift, n) => void dialogs.confirmRollback(lift, n)}
        />
      ) : null}
    </View>
  );
}

type TmsByLift = ReturnType<typeof useSettingsScreenData>['tmsByLift'];

// Preview every TM that the migration will actually rewrite  -  including TMs for
// currently-disabled lifts. Iterating only enabledLifts would silently migrate
// disabled-lift TMs without surfacing to the user.
function buildTmPreviews(
  tmsByLift: TmsByLift,
  pendingStorage: ReturnType<typeof useSettingsDialogs>['pendingStorage'],
): TmPreview[] {
  if (!pendingStorage) return [];
  return Object.entries(tmsByLift ?? {})
    .map<TmPreview | null>(([liftKey, tm]) => {
      if (!tm) return null;
      return {
        lift: liftKey as Lift,
        oldValue: tm.value,
        oldUnit: tm.unit,
        newValue: convertAndSnap(tm.value, tm.unit, pendingStorage),
      };
    })
    .filter((p): p is TmPreview => p !== null);
}
