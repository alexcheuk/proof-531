import { goTo } from '@/app/routes';
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
import { ScrollView, type ViewStyle } from 'react-native';
import { NoTrainingMaxState } from './components/NoTrainingMaxState';
import { SessionLayout } from './components/SessionLayout';
import { SessionTopBar } from './components/SessionTopBar';
import { TodayBody } from './components/TodayBody';
import { useHardwareBack } from './hooks/useHardwareBack';
import { useTodayScreenState } from './hooks/useTodayScreenState';

export function TodayScreen({ lift }: { lift: Lift }) {
  const router = useRouter();
  const settings = useSettings();
  const tm = useLatestTm(lift);
  const state = useTodayScreenState(lift);
  const { colors } = useTheme();

  // Match the visible back chip — always return to Home, never the tab the
  // user originated from. Stack-default back lands on whichever tab pushed
  // here (often History), which doesn't match the user's mental model.
  useHardwareBack({ enabled: true, onBack: () => goTo.home(router) });

  // Loading — blank paper canvas, no flicker.
  if (settings.isLoading || tm.isLoading) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }
  // No TM for this lift (or settings row missing) → render a real empty
  // state with an explanation + CTA so the user understands why the page
  // is empty and how to fix it.
  if (!settings.data || !tm.data) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
        <SessionTopBar onBack={() => goTo.home(router)} />
        <NoTrainingMaxState lift={lift} onOpenSettings={() => goTo.settings(router)} />
      </SessionLayout>
    );
  }

  const storageUnit = tm.data.unit;
  const displayUnit = settings.data.displayUnit ?? settings.data.storageUnit;

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  // CTA copy mirrors the PWA's bottom-CTA matrix
  // (`531-pwa/src/features/session/TodayScreen.tsx`):
  //   preview                → "Begin session"
  //   active (no logs yet)   → "Start session"
  //   active (>=1 log)       → "Resume · set N of 3" (surfaces partial
  //                             progress at the CTA so the user knows
  //                             exactly where they're picking up).
  //   preview-other-active   → "Open <other lift> →"
  const ctaLabel =
    state.mode === 'preview'
      ? 'Begin session'
      : state.mode === 'preview-other-active' && state.otherLift
        ? `Open ${state.otherLift} →`
        : state.completedCount === 0
          ? 'Start session'
          : `Resume · set ${state.completedCount + 1} of 3`;
  const ctaGlyph = state.mode === 'active' && state.completedCount > 0 ? '↩' : '→';

  return (
    <SessionLayout>
      <StatusBar style="dark" />
      <SessionTopBar onBack={() => goTo.home(router)} />
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
          plateSet={settings.data.plateSet}
          completedIndices={state.completedIndices}
          nextSetIndex={state.nextSetIndex !== null ? ((state.nextSetIndex + 1) as 1 | 2 | 3) : 1}
          restTargetSeconds={settings.data.restTargetSeconds}
        />
      </ScrollView>
      <CtaBar>
        <PrimaryPillButton
          testID="start-session"
          glyph={ctaGlyph}
          onPress={state.onPressCta}
          disabled={state.starting}
        >
          {ctaLabel}
        </PrimaryPillButton>
      </CtaBar>
    </SessionLayout>
  );
}
