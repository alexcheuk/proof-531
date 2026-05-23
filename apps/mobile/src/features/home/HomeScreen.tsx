import { useDb } from '@/data/DbProvider';
import { createSession } from '@/data/accessors/session';
import { useLatestTms } from '@/data/queries/useLatestTm';
import { usePrs } from '@/data/queries/usePrs';
import { useSettings } from '@/data/queries/useSettings';
import { Masthead } from '@/design/primitives/Masthead';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { dateLabel } from '@/domain/labels';
import type { Lift } from '@/domain/types';
import { QueryShell, combineQueries } from '@/features/shared/QueryShell';
import { useQueryClient } from '@tanstack/react-query';
/**
 * Home screen — composes Masthead + LiftTabs + LiftPage.
 *
 * Ported from `~/Development/531-pwa/src/features/home/HomeScreen.tsx`.
 * The PWA carousel is collapsed to a single page keyed on the selected
 * lift; layout swaps animate via Reanimated `LinearTransition` (see
 * `LiftPage`). The CycleStrip lives inside LiftPage (matching the PWA
 * structure post-PE-09); HomeScreen no longer renders it directly.
 *
 * Boundary: this file lives under `features/` and composes design
 * primitives + data queries — it never imports drizzle hex directly.
 * The single `createSession` call below is the one allowed exception
 * (accessors are explicitly safe to call from features per §3 of the
 * boundary rules — only the raw drizzle handle is forbidden).
 */
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LiftPage } from './components/LiftPage';
import { LiftTabs } from './components/LiftTabs';
import { useHomeScreenState } from './hooks/useHomeScreenState';

export function HomeScreen() {
  const router = useRouter();
  const settings = useSettings();
  const tms = useLatestTms();
  const prs = usePrs();
  const db = useDb();
  const queryClient = useQueryClient();

  const enabledLifts = settings.data?.enabledLifts ?? [];
  const firstLift: Lift = enabledLifts[0] ?? 'squat';
  const { selectedLift, setSelectedLift, inProgressLift } = useHomeScreenState(firstLift);

  // If onboarding has not produced an enabled-lifts set, redirect.
  useEffect(() => {
    if (settings.data && settings.data.enabledLifts.length === 0) {
      router.replace('/onboarding');
    }
  }, [settings.data, router]);

  const combined = combineQueries(settings, tms, prs);
  if (combined.isLoading || combined.isError) {
    return (
      <Container>
        <QueryShell query={combined}>{null}</QueryShell>
      </Container>
    );
  }
  if (!settings.data || enabledLifts.length === 0) {
    return null;
  }

  // If the selected lift is no longer enabled (e.g. settings edit), snap
  // back to the first enabled lift.
  const selectedToRender = enabledLifts.includes(selectedLift) ? selectedLift : firstLift;

  const tmRow = tms.data?.find((t) => t.lift === selectedToRender);
  const pr = prs.data?.find((p) => p.lift === selectedToRender);

  const storageUnit = tmRow?.unit ?? settings.data.storageUnit;
  const displayUnit = settings.data.displayUnit ?? settings.data.storageUnit;

  const handleBegin = async (lift: Lift) => {
    // Single-session invariant (§4): if another lift is mid-session, do not
    // start a second one. Navigate to that lift instead.
    if (inProgressLift && inProgressLift !== lift) {
      // typedRoutes is disabled (PF-05); cast the params object.
      router.push({ pathname: '/session/today', params: { lift: inProgressLift } } as never);
      return;
    }
    try {
      await createSession(db, lift);
      await queryClient.invalidateQueries({ queryKey: ['activeSession'] });
      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (err) {
      console.error('HomeScreen.handleBegin createSession failed', err);
    }
    router.push({ pathname: '/session/today', params: { lift } } as never);
  };

  const handleResume = (lift: Lift) => {
    router.push({ pathname: '/session/today', params: { lift } } as never);
  };

  const handleOpenPlan = (lift: Lift) => {
    router.push({ pathname: '/session/today', params: { lift } } as never);
  };

  return (
    <Container>
      <Masthead rightSlot={<DateBadge label={dateLabel(new Date())} />} />
      <LiftTabs
        enabled={enabledLifts}
        selected={selectedToRender}
        inProgressLift={inProgressLift}
        onSelect={setSelectedLift}
      />
      <LiftPage
        lift={selectedToRender}
        week={settings.data.week}
        cycle={settings.data.currentCycle}
        storageUnit={storageUnit}
        displayUnit={displayUnit}
        plateSet={settings.data.plateSet}
        tm={tmRow?.value ?? null}
        bestE1RM={pr?.bestE1RM ?? null}
        isInProgress={selectedToRender === inProgressLift}
        onBegin={() => handleBegin(selectedToRender)}
        onResume={() => handleResume(selectedToRender)}
        onOpenPlan={() => handleOpenPlan(selectedToRender)}
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
  return (
    <View style={style}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
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
