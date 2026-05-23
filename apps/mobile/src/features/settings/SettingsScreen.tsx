/**
 * Settings screen — eight-section LEDGER register.
 *
 * Ported from `~/Development/531-pwa/src/features/settings/SettingsScreen.tsx`.
 * Sections in order: Units (storage + display), Active lifts, Training maxes,
 * Cycle prescription, Progression rules, Plate set, About, Danger zone.
 *
 * TM edits open `TmEditSheet` (PD-04 append-only contract). A storage-unit
 * flip routes through `UnitMigrationSheet` (which calls `migrateStorageUnit`).
 * Reset routes through `ResetConfirmSheet` (which calls `resetEverything`
 * then navigates to `/onboarding`).
 */
import { useDb } from '@/data/DbProvider';
import { migrateStorageUnit } from '@/data/accessors/migrateStorageUnit';
import { resetEverything } from '@/data/accessors/reset';
import { setDisplayUnit, updateSettings } from '@/data/accessors/settings';
import { TM_KEY } from '@/data/queries/useLatestTm';
import { SETTINGS_KEY } from '@/data/queries/useSettings';
import { CheckboxLedger } from '@/design/primitives/CheckboxLedger';
import { LedgerRow, LedgerRowLabel, LedgerRowValue } from '@/design/primitives/LedgerRow';
import { LedgerSection } from '@/design/primitives/LedgerSection';
import { Masthead } from '@/design/primitives/Masthead';
import { SegRail } from '@/design/primitives/SegRail';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { tmIncrement } from '@/domain/increments';
import type { Lift, Settings, Unit } from '@/domain/types';
import { convertAndSnap, displayUnit as displayUnitGlyph } from '@/domain/units';
import { QueryShell } from '@/features/shared/QueryShell';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Text as RNText, ScrollView, type TextStyle, View, type ViewStyle } from 'react-native';
import { ResetConfirmSheet } from './components/ResetConfirmSheet';
import { TmEditSheet } from './components/TmEditSheet';
import { type TmPreview, UnitMigrationSheet } from './components/UnitMigrationSheet';
import { useSettingsScreenData } from './hooks/useSettingsScreenData';
import { useToggleLift } from './hooks/useToggleLift';
import { LIFT_META, LIFT_ORDER } from './lifts';
import { type PlateSetUi, schemaToUiPlateSet, uiToSchemaPlateSet } from './plateSetMapping';

const LOWER_BODY: ReadonlySet<Lift> = new Set<Lift>(['squat', 'deadlift']);

export function SettingsScreen() {
  const { colors, type } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const db = useDb();

  const screenData = useSettingsScreenData();
  const { settings, tmsByLift, isLoading, isError, error, refetch } = screenData;

  const [editingLift, setEditingLift] = useState<Lift | null>(null);
  const [pendingStorage, setPendingStorage] = useState<Unit | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);

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
        <StatusBar style="dark" />
        <Masthead rightSlot={<RNText style={settingsCapsStyle}>settings</RNText>} />
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
  const displayUnitVal = settings.displayUnit ?? storageUnit;

  const tmPreviews: TmPreview[] = pendingStorage
    ? settings.enabledLifts
        .map<TmPreview | null>((lift) => {
          const tm = tmsByLift?.[lift];
          if (!tm) return null;
          return {
            lift,
            oldValue: tm.value,
            oldUnit: tm.unit,
            newValue: convertAndSnap(tm.value, tm.unit, pendingStorage),
          };
        })
        .filter((p): p is TmPreview => p !== null)
    : [];

  const onConfirmMigration = async () => {
    if (!pendingStorage || migrating) return;
    setMigrating(true);
    try {
      await migrateStorageUnit(db, pendingStorage);
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      await queryClient.invalidateQueries({ queryKey: TM_KEY });
      setPendingStorage(null);
    } catch (err) {
      console.error('migrateStorageUnit failed', err);
    } finally {
      setMigrating(false);
    }
  };

  const onConfirmReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await resetEverything(db);
      queryClient.clear();
      setConfirmingReset(false);
      // biome-ignore lint/suspicious/noExplicitAny: expo-router typed route literals
      router.replace('/onboarding' as any);
    } catch (err) {
      console.error('resetEverything failed', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <View style={containerStyle}>
      <StatusBar style="dark" />
      <Masthead rightSlot={<RNText style={settingsCapsStyle}>settings</RNText>} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        testID="settings-scroll"
        stickyHeaderIndices={[]}
      >
        <TitleBlock eyebrow="The dials" title="Settings." />

        <UnitsSection
          storageUnit={storageUnit}
          displayUnit={displayUnitVal}
          onStorageRequest={(next) => {
            if (next !== storageUnit) setPendingStorage(next);
          }}
        />

        <ActiveLiftsSection enabled={settings.enabledLifts} storageUnit={storageUnit} />

        <TrainingMaxSection settings={settings} tmsByLift={tmsByLift} onEdit={setEditingLift} />

        <CyclePrescriptionSection />

        <ProgressionRulesSection storageUnit={storageUnit} />

        <PlateSetSection plateSet={settings.plateSet} />

        <AboutSection />

        <DangerZoneSection onReset={() => setConfirmingReset(true)} />

        <Colophon />
      </ScrollView>

      {editingLift ? (
        <TmEditSheet
          lift={editingLift}
          currentValue={tmsByLift?.[editingLift]?.value ?? 0}
          storageUnit={tmsByLift?.[editingLift]?.unit ?? storageUnit}
          displayUnit={displayUnitVal}
          onClose={() => setEditingLift(null)}
        />
      ) : null}

      {pendingStorage ? (
        <UnitMigrationSheet
          open
          currentUnit={storageUnit}
          targetUnit={pendingStorage}
          tmPreviews={tmPreviews}
          pending={migrating}
          onCancel={() => {
            if (!migrating) setPendingStorage(null);
          }}
          onConfirm={() => void onConfirmMigration()}
        />
      ) : null}

      {confirmingReset ? (
        <ResetConfirmSheet
          open
          pending={resetting}
          onCancel={() => {
            if (!resetting) setConfirmingReset(false);
          }}
          onConfirm={() => void onConfirmReset()}
        />
      ) : null}
    </View>
  );
}

// ────────────────────────────────────────────────────────────
// Colophon
// ────────────────────────────────────────────────────────────

function Colophon() {
  const { colors, type } = useTheme();
  const wrap: ViewStyle = {
    paddingTop: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
  };
  const label: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 2.88,
    textTransform: 'uppercase',
    color: colors.ink3,
    textAlign: 'center',
  };
  return (
    <View style={wrap}>
      <RNText style={label}>— end of register —</RNText>
    </View>
  );
}

// ────────────────────────────────────────────────────────────
// Section: Units (storage + display)
// ────────────────────────────────────────────────────────────

function UnitsSection({
  storageUnit,
  displayUnit: displayUnitValue,
  onStorageRequest,
}: {
  storageUnit: Unit;
  displayUnit: Unit;
  onStorageRequest: (next: Unit) => void;
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

  const captionStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.26,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: spacing.sm,
  };

  const unitOptions = [
    { value: 'lbs' as const, label: 'Pounds · lb' },
    { value: 'kg' as const, label: 'Kilograms · kg' },
  ];

  async function commitDisplayUnit(next: Unit) {
    await setDisplayUnit(db, next);
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Units" hint="storage · display">
      <RNText style={subLabelStyle}>Training unit</RNText>
      <SegRail
        testID="settings-storage-unit"
        value={storageUnit}
        options={unitOptions}
        onChange={(next) => onStorageRequest(next)}
      />
      <RNText style={captionStyle}>flipping converts your training maxes</RNText>

      <RNText style={subLabelStyle}>Display unit</RNText>
      <SegRail
        testID="settings-display-unit"
        value={displayUnitValue}
        options={unitOptions}
        onChange={(next) => void commitDisplayUnit(next)}
      />
      <RNText style={captionStyle}>changes how weights are shown · no data change</RNText>
    </LedgerSection>
  );
}

// ────────────────────────────────────────────────────────────
// Section: Active lifts
// ────────────────────────────────────────────────────────────

function ActiveLiftsSection({
  enabled,
  storageUnit,
}: {
  enabled: Lift[];
  storageUnit: Unit;
}) {
  const hint = `${enabled.length} of 4 · ${enabled.length * 4} sessions per cycle`;
  const toggle = useToggleLift();

  return (
    <LedgerSection title="Active lifts" hint={hint}>
      {LIFT_ORDER.map((lift, i) => {
        const isOn = enabled.includes(lift);
        const isLastEnabled = isOn && enabled.length === 1;
        const isLower = LOWER_BODY.has(lift);
        const bump = tmIncrement(storageUnit, lift);
        const secondary = isLower
          ? `+${bump} ${displayUnitGlyph(storageUnit)} / cycle · lower body`
          : `+${bump} ${displayUnitGlyph(storageUnit)} / cycle · upper body`;
        return (
          <LedgerRow
            key={lift}
            first={i === 0}
            disabled={isLastEnabled}
            onPress={() => void toggle(lift)}
            testID={`settings-lift-toggle-${lift}`}
          >
            <LedgerRowLabel primary={LIFT_META[lift].label} secondary={secondary} />
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
// Section: Training maxes
// ────────────────────────────────────────────────────────────

type TmsByLift = ReturnType<typeof useSettingsScreenData>['tmsByLift'];

function TrainingMaxSection({
  settings,
  tmsByLift,
  onEdit,
}: {
  settings: Settings;
  tmsByLift: TmsByLift;
  onEdit: (lift: Lift) => void;
}) {
  return (
    <LedgerSection title="Training max" hint="90% of 1rm · adjust as you bump cycles">
      {settings.enabledLifts.map((lift, i) => {
        const tm = tmsByLift?.[lift];
        const value = tm?.value ?? 0;
        // Render the unit from the TM row itself, not from settings.unit, so
        // the historical write's interpretation is preserved across a
        // display-unit flip.
        const tmUnit: Unit = tm?.unit ?? settings.storageUnit;
        return (
          <LedgerRow
            key={lift}
            first={i === 0}
            onPress={() => onEdit(lift)}
            testID={`settings-tm-row-${lift}`}
          >
            <LedgerRowLabel primary={LIFT_META[lift].label} />
            <LedgerRowValue value={`${value} ${displayUnitGlyph(tmUnit)}  ›`} numeric />
          </LedgerRow>
        );
      })}
    </LedgerSection>
  );
}

// ────────────────────────────────────────────────────────────
// Section: Cycle prescription (static read-only)
// ────────────────────────────────────────────────────────────

interface CycleRow {
  label: string;
  pct: string;
  reps: string;
}

const CYCLE_ROWS: readonly CycleRow[] = [
  { label: 'Week 1', pct: '65 · 75 · 85', reps: '5 / 5 / 5+' },
  { label: 'Week 2', pct: '70 · 80 · 90', reps: '3 / 3 / 3+' },
  { label: 'Week 3', pct: '75 · 85 · 95', reps: '5 / 3 / 1+' },
  { label: 'Week 4', pct: '40 · 50 · 60', reps: '5 / 5 / 5 · deload' },
];

function CyclePrescriptionSection() {
  return (
    <LedgerSection title="Cycle prescription" hint="the original 5/3/1 · read only">
      {CYCLE_ROWS.map((w, i) => (
        <LedgerRow key={w.label} first={i === 0}>
          <LedgerRowLabel primary={w.label} secondary={w.reps} />
          <LedgerRowValue value={`${w.pct} %`} sub="TM %" numeric />
        </LedgerRow>
      ))}
    </LedgerSection>
  );
}

// ────────────────────────────────────────────────────────────
// Section: Progression rules
// ────────────────────────────────────────────────────────────

function ProgressionRulesSection({ storageUnit }: { storageUnit: Unit }) {
  const glyph = displayUnitGlyph(storageUnit);
  return (
    <LedgerSection title="Progression rules" hint="per cycle bump">
      {LIFT_ORDER.map((lift, i) => {
        const isLower = LOWER_BODY.has(lift);
        const bump = tmIncrement(storageUnit, lift);
        return (
          <LedgerRow key={lift} first={i === 0}>
            <LedgerRowLabel
              primary={LIFT_META[lift].label}
              secondary={isLower ? 'lower body' : 'upper body'}
            />
            <LedgerRowValue value={`+${bump} ${glyph}`} sub="per cycle" />
          </LedgerRow>
        );
      })}
    </LedgerSection>
  );
}

// ────────────────────────────────────────────────────────────
// Section: Plate set
// ────────────────────────────────────────────────────────────

function PlateSetSection({ plateSet }: { plateSet: Settings['plateSet'] }) {
  const db = useDb();
  const queryClient = useQueryClient();

  const uiPlateSet: PlateSetUi = schemaToUiPlateSet(plateSet);

  const plateOptions = [
    { value: 'standard' as const, label: 'lb plates' },
    { value: 'metric' as const, label: 'kg plates' },
    { value: 'custom' as const, label: 'Custom', disabled: true },
  ];

  async function commitPlateSet(next: PlateSetUi) {
    const schemaValue = uiToSchemaPlateSet(next);
    if (schemaValue == null) return;
    await updateSettings(db, { plateSet: schemaValue });
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  }

  return (
    <LedgerSection title="Plate set">
      <SegRail
        testID="settings-plate-set"
        value={uiPlateSet}
        options={plateOptions}
        onChange={(next) => void commitPlateSet(next)}
      />
    </LedgerSection>
  );
}

// ────────────────────────────────────────────────────────────
// Section: About
// ────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <LedgerSection title="About">
      <LedgerRow first>
        <LedgerRowLabel primary="Program" secondary="Jim Wendler · 5/3/1 for beginners" />
        <LedgerRowValue value="v3.0" />
      </LedgerRow>
      <LedgerRow>
        <LedgerRowLabel primary="App version" secondary="531. ledger · paper-and-ink discipline" />
        <LedgerRowValue value="0.1.0" sub="alpha" />
      </LedgerRow>
    </LedgerSection>
  );
}

// ────────────────────────────────────────────────────────────
// Section: Danger zone
// ────────────────────────────────────────────────────────────

function DangerZoneSection({ onReset }: { onReset: () => void }) {
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
