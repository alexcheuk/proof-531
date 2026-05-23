import { useDb } from '@/data/DbProvider';
/**
 * Settings screen — composes Masthead + TitleBlock + the LEDGER register of
 * sections (PROGRAM training maxes, ACTIVE LIFTS toggles, DISPLAY units +
 * plate set).
 *
 * Ported from `~/Development/531-pwa/src/features/settings/SettingsScreen.tsx`.
 * The mobile port ships the structural skeleton — the PWA's UnitMigration and
 * ResetConfirm sheets are out of scope for PE-08; this screen lands the
 * append-only TM edit flow (the PD-04 invariant) and the active-lifts toggle.
 */
import { updateSettings } from '@/data/accessors/settings';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import { CheckboxLedger } from '@/design/primitives/CheckboxLedger';
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { Masthead } from '@/design/primitives/Masthead';
import { SegRail } from '@/design/primitives/SegRail';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import type { Lift, PlateSet, Settings, Unit } from '@/domain/types';
import { displayUnit as displayUnitGlyph } from '@/domain/units';
import { QueryShell } from '@/features/shared/QueryShell';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Text as RNText, ScrollView, type TextStyle, View, type ViewStyle } from 'react-native';
import { TmEditSheet } from './components/TmEditSheet';
import { useSettingsScreenData } from './hooks/useSettingsScreenData';
import { useToggleLift } from './hooks/useToggleLift';
import { LIFT_META, LIFT_ORDER } from './lifts';
import { type PlateSetUi, schemaToUiPlateSet, uiToSchemaPlateSet } from './plateSetMapping';

export function SettingsScreen() {
  const { colors, type } = useTheme();
  const screenData = useSettingsScreenData();
  const { settings, tmsByLift, isLoading, isError, error, refetch } = screenData;
  const [editingLift, setEditingLift] = useState<Lift | null>(null);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  const settingsCapsStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  if (isLoading || isError) {
    return (
      <View style={containerStyle} testID="settings-loading">
        <Masthead rightSlot={<RNText style={settingsCapsStyle}>settings</RNText>} />
        <QueryShell query={{ isLoading, isError, error, refetch }}>{null}</QueryShell>
      </View>
    );
  }

  if (!settings) {
    return <View style={containerStyle} testID="settings-loading" />;
  }

  const storageUnit = settings.storageUnit;
  const displayUnit = settings.displayUnit ?? storageUnit;

  return (
    <View style={containerStyle}>
      <Masthead rightSlot={<RNText style={settingsCapsStyle}>settings</RNText>} />
      <TitleBlock eyebrow="The dials" title="Settings." />

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} testID="settings-scroll">
        <ProgramSection settings={settings} tmsByLift={tmsByLift} onEdit={setEditingLift} />
        <ActiveLiftsSection enabled={settings.enabledLifts} />
        <DisplaySection displayUnit={displayUnit} plateSet={settings.plateSet} />
      </ScrollView>

      {editingLift ? (
        <TmEditSheet
          lift={editingLift}
          currentValue={tmsByLift?.[editingLift]?.value ?? 0}
          storageUnit={tmsByLift?.[editingLift]?.unit ?? storageUnit}
          displayUnit={displayUnit}
          onClose={() => setEditingLift(null)}
        />
      ) : null}
    </View>
  );
}

// ────────────────────────────────────────────────────────────
// PROGRAM section — current TM per enabled lift; tap to open TmEditSheet.
// ────────────────────────────────────────────────────────────

type TmsByLift = ReturnType<typeof useSettingsScreenData>['tmsByLift'];

function ProgramSection({
  settings,
  tmsByLift,
  onEdit,
}: {
  settings: Settings;
  tmsByLift: TmsByLift;
  onEdit: (lift: Lift) => void;
}) {
  return (
    <LedgerSection title="Program" hint="training max · per lift">
      {settings.enabledLifts.map((lift, i) => {
        const tm = tmsByLift?.[lift];
        const value = tm?.value ?? 0;
        // Render the unit from the TM row itself, not from settings.unit, so
        // the historical write's interpretation is preserved across a
        // display-unit flip. Falls back to current storage unit only when the
        // lift has never had a TM written.
        const tmUnit: Unit = tm?.unit ?? settings.storageUnit;
        return (
          <LedgerRow
            key={lift}
            first={i === 0}
            onPress={() => onEdit(lift)}
            testID={`settings-tm-row-${lift}`}
          >
            <LedgerRowLabel primary={LIFT_META[lift].label} />
            <LedgerRowValue value={`${value} ${displayUnitGlyph(tmUnit)}`} numeric />
          </LedgerRow>
        );
      })}
    </LedgerSection>
  );
}

// ────────────────────────────────────────────────────────────
// ACTIVE LIFTS — toggle which of the four lifts are part of the cycle.
// ────────────────────────────────────────────────────────────

function ActiveLiftsSection({ enabled }: { enabled: Lift[] }) {
  const hint = `${enabled.length} of 4 · ${enabled.length * 4} sessions per cycle`;
  const toggle = useToggleLift();

  return (
    <LedgerSection title="Active lifts" hint={hint}>
      {LIFT_ORDER.map((lift, i) => {
        const isOn = enabled.includes(lift);
        const isLastEnabled = isOn && enabled.length === 1;
        return (
          <LedgerRow
            key={lift}
            first={i === 0}
            disabled={isLastEnabled}
            onPress={() => void toggle(lift)}
            testID={`settings-lift-toggle-${lift}`}
          >
            <LedgerRowLabel primary={LIFT_META[lift].label} />
            <CheckboxLedger
              checked={isOn}
              disabled={isLastEnabled}
              testID={`settings-lift-checkbox-${lift}`}
            />
          </LedgerRow>
        );
      })}
    </LedgerSection>
  );
}

// ────────────────────────────────────────────────────────────
// DISPLAY — display unit + plate set.
// ────────────────────────────────────────────────────────────

function DisplaySection({
  displayUnit,
  plateSet,
}: {
  displayUnit: Unit;
  plateSet: PlateSet;
}) {
  const db = useDb();
  const queryClient = useQueryClient();
  const { colors, type, spacing } = useTheme();

  const subLabelStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 9,
    letterSpacing: 1.98,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  };

  const uiPlateSet: PlateSetUi = schemaToUiPlateSet(plateSet);

  const unitOptions = [
    { value: 'lbs' as const, label: 'Pounds · lb' },
    { value: 'kg' as const, label: 'Kilograms · kg' },
  ];

  const plateOptions = [
    { value: 'standard' as const, label: 'Standard' },
    { value: 'metric' as const, label: 'Metric' },
    { value: 'custom' as const, label: 'Custom', disabled: true },
  ];

  async function commitDisplayUnit(next: Unit) {
    await updateSettings(db, { displayUnit: next });
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  async function commitPlateSet(next: PlateSetUi) {
    const schemaValue = uiToSchemaPlateSet(next);
    if (schemaValue == null) return;
    await updateSettings(db, { plateSet: schemaValue });
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Display">
      <RNText style={subLabelStyle}>Display unit</RNText>
      <SegRail
        testID="settings-display-unit"
        value={displayUnit}
        options={unitOptions}
        onChange={(next) => void commitDisplayUnit(next)}
      />

      <RNText style={subLabelStyle}>Plate set</RNText>
      <SegRail
        testID="settings-plate-set"
        value={uiPlateSet}
        options={plateOptions}
        onChange={(next) => void commitPlateSet(next)}
      />
    </LedgerSection>
  );
}
