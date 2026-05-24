/**
 * Settings screen — composition shell for the LEDGER register.
 *
 * Ported from `~/Development/531-pwa/src/features/settings/SettingsScreen.tsx`.
 * All section bodies live under `./sections/`; dialog state (TM editor, unit
 * migration, destructive reset) is owned by `useSettingsDialogs`. This file
 * is intentionally thin so the section order is the first thing a reader sees.
 */
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
import { TmEditSheet } from './components/TmEditSheet';
import { type TmPreview, UnitMigrationSheet } from './components/UnitMigrationSheet';
import { useSettingsDialogs } from './hooks/useSettingsDialogs';
import { useSettingsScreenData } from './hooks/useSettingsScreenData';
import { AboutSection } from './sections/AboutSection';
import { ActiveLiftsSection } from './sections/ActiveLiftsSection';
import { Colophon } from './sections/Colophon';
import { CyclePrescriptionSection } from './sections/CyclePrescriptionSection';
import { DangerZoneSection } from './sections/DangerZoneSection';
import { PlateSetSection } from './sections/PlateSetSection';
import { ProgressionRulesSection } from './sections/ProgressionRulesSection';
import { RestTargetSection } from './sections/RestTargetSection';
import { TrainingMaxSection } from './sections/TrainingMaxSection';
import { UnitsSection } from './sections/UnitsSection';

export function SettingsScreen() {
  const { colors } = useTheme();
  const screenData = useSettingsScreenData();
  const { settings, tmsByLift, isLoading, isError, error, refetch } = screenData;

  const dialogs = useSettingsDialogs(settings?.storageUnit ?? 'lbs');

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  if (isLoading || isError) {
    return (
      <View style={containerStyle} testID="settings-loading">
        <StatusBar style="dark" />
        <Masthead rightSlot={<CapsLabel>settings</CapsLabel>} />
        <QueryShell query={{ isLoading, isError, error, refetch }}>{null}</QueryShell>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={containerStyle} testID="settings-loading">
        <StatusBar style="dark" />
      </View>
    );
  }

  const storageUnit = settings.storageUnit;
  const displayUnit = settings.displayUnit ?? storageUnit;
  const tmPreviews = buildTmPreviews(tmsByLift, dialogs.pendingStorage);

  return (
    <View style={containerStyle}>
      <StatusBar style="dark" />
      <Masthead rightSlot={<CapsLabel>settings</CapsLabel>} />

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} testID="settings-scroll">
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

        <RestTargetSection restTargetSeconds={settings.restTargetSeconds} />

        <AboutSection />

        <DangerZoneSection onReset={dialogs.requestReset} />

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
    </View>
  );
}

type TmsByLift = ReturnType<typeof useSettingsScreenData>['tmsByLift'];

// Preview every TM that the migration will actually rewrite — including TMs for
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
