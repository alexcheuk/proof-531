import { useLatestTm } from '@/data/queries/useLatestTm';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
/**
 * Today screen — preview of the upcoming session + Start CTA.
 *
 * Ported (lightly trimmed) from `~/Development/531-pwa/src/features/session/
 * TodayScreen.tsx`. The PWA hosts a full state machine (preview / active /
 * preview-other-active / empty) here; the mobile MVP shows the preview surface
 * and a Start CTA. Active-session UI ships in a follow-up task.
 *
 * Boundary: this file composes design primitives + data query hooks + the
 * feature-local `useTodayScreenState` hook. No drizzle imports, no hex
 * literals. The route shell at `apps/mobile/src/app/session/today.tsx` is a
 * thin wrapper that parses `:lift` from the URL.
 */
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SessionLayout } from './components/SessionLayout';
import { SessionTopBar } from './components/SessionTopBar';
import { TodayBody } from './components/TodayBody';
import { useTodayScreenState } from './hooks/useTodayScreenState';

export function TodayScreen({ lift }: { lift: Lift }) {
  const router = useRouter();
  const settings = useSettings();
  const tm = useLatestTm(lift);
  const { starting, start } = useTodayScreenState(lift);
  const { colors } = useTheme();

  // Loading — blank paper canvas, no flicker.
  if (settings.isLoading || tm.isLoading) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }
  // No TM for this lift or settings missing → blank canvas (PE-04 ships the
  // preview path; empty-state UI follows when the Live screen lands).
  if (!settings.data || !tm.data) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }

  const storageUnit = tm.data.unit;
  const displayUnit = settings.data.displayUnit ?? settings.data.storageUnit;

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  return (
    <SessionLayout>
      <StatusBar style="dark" />
      <SessionTopBar onBack={() => router.back()} />
      <ScrollView
        style={scrollStyle}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <TodayBody
          lift={lift}
          week={settings.data.week}
          cycle={settings.data.currentCycle}
          storageUnit={storageUnit}
          displayUnit={displayUnit}
          tm={tm.data.value}
        />
        {/* Reserve room above the sticky CtaBar so the colophon isn't clipped. */}
        <View style={{ height: 120 }} />
      </ScrollView>
      <CtaBar>
        <PrimaryPillButton testID="start-session" onPress={start} disabled={starting}>
          Start Session
        </PrimaryPillButton>
      </CtaBar>
    </SessionLayout>
  );
}
