import { useLatestTms } from '@/data/queries/useLatestTm';
import { usePrs } from '@/data/queries/usePrs';
import { useSettings } from '@/data/queries/useSettings';
import { Masthead } from '@/design/primitives/Masthead';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { dateLabel } from '@/domain/labels';
import type { Lift } from '@/domain/types';
/**
 * Home screen — composes Masthead + CycleStrip + LiftTabs + LiftPage.
 *
 * Ported from `~/Development/531-pwa/src/features/home/HomeScreen.tsx`.
 * The PWA carousel is collapsed to a single page keyed on the selected
 * lift; layout swaps animate via Reanimated `LinearTransition` (see
 * `LiftPage`).
 *
 * Boundary: this file lives under `features/` and composes design
 * primitives + data queries — it never imports drizzle or design hex
 * directly.
 */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import { CycleStrip } from './components/CycleStrip';
import { LiftPage } from './components/LiftPage';
import { LiftTabs } from './components/LiftTabs';
import { useHomeScreenState } from './hooks/useHomeScreenState';

export function HomeScreen() {
  const router = useRouter();
  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();

  const enabledLifts = settings.data?.enabledLifts ?? [];
  const firstLift: Lift = enabledLifts[0] ?? 'squat';
  const { selectedLift, setSelectedLift } = useHomeScreenState(firstLift);

  // If onboarding has not produced an enabled-lifts set, redirect.
  useEffect(() => {
    if (settings.data && settings.data.enabledLifts.length === 0) {
      router.replace('/onboarding');
    }
  }, [settings.data, router]);

  if (settings.isLoading || tms.isLoading) {
    return null;
  }
  if (!settings.data || enabledLifts.length === 0) {
    return null;
  }

  // If the selected lift is no longer enabled (e.g. settings edit), snap
  // back to the first enabled lift. This is a render-phase derivation, so
  // we mirror it in `selectedToRender` and let the next render commit it
  // via the setter side-effect.
  const selectedToRender = enabledLifts.includes(selectedLift) ? selectedLift : firstLift;

  const tmRow = tms.data?.find((t) => t.lift === selectedToRender);
  const pr = prs.data?.find((p) => p.lift === selectedToRender);

  const storageUnit = tmRow?.unit ?? settings.data.storageUnit;
  const displayUnit = settings.data.displayUnit ?? settings.data.storageUnit;

  return (
    <Container>
      <Masthead rightSlot={<DateBadge label={dateLabel(new Date())} />} />
      <CycleStrip cycle={settings.data.currentCycle} week={settings.data.week} />
      <LiftTabs enabled={enabledLifts} selected={selectedToRender} onSelect={setSelectedLift} />
      <LiftPage
        lift={selectedToRender}
        week={settings.data.week}
        cycle={settings.data.currentCycle}
        storageUnit={storageUnit}
        displayUnit={displayUnit}
        plateSet={settings.data.plateSet}
        tm={tmRow?.value ?? null}
        bestE1RM={pr?.bestE1RM ?? null}
      />
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const style: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };
  return <View style={style}>{children}</View>;
}

function DateBadge({ label }: { label: string }) {
  return (
    <Text
      variant="mono"
      weight="medium"
      size={10}
      color="ink2"
      style={{ textTransform: 'uppercase', letterSpacing: 1.8 }}
    >
      {label}
    </Text>
  );
}
