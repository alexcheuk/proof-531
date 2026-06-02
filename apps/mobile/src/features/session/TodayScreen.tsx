import { useLatestTm } from '@/data/queries/useLatestTm';
import { useLiftProgress } from '@/data/queries/useLiftProgress';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { goTo } from '@/lib/routes';
/**
 * Today screen — preview of the upcoming session + Start CTA.
 *
 * Thin composition shell. Delegates state to `useTodayScreenState`.
 * Boundary: design primitives + data query hooks only; no drizzle, no hex.
 */
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, type ViewStyle } from 'react-native';
import { NoTrainingMaxState } from './components/NoTrainingMaxState';
import { ResetConfirmSheet } from './components/ResetConfirmSheet';
import { SessionLayout } from './components/SessionLayout';
import { SessionTopBar } from './components/SessionTopBar';
import { TodayBody } from './components/TodayBody/TodayBody';
import { useHardwareBack } from './hooks/useHardwareBack';
import { useTodayScreenState } from './hooks/useTodayScreenState';
import { useTodaySessionActions } from './hooks/useTodaySessionActions';

export function TodayScreen({ lift }: { lift: Lift }) {
  const router = useRouter();
  const settings = useSettings();
  const tm = useLatestTm(lift);
  // Per-lift cycle/week — the preview shows where THIS lift sits in its own
  // 5/3/1 cycle, independent of any other lift the user is also training.
  const progress = useLiftProgress(lift);
  const state = useTodayScreenState(lift);
  const { colors } = useTheme();
  // Restart lives on the Today top bar when this lift has an active
  // session. Hook is mounted unconditionally so its state survives
  // re-renders; controls only surface when state.mode === 'active'.
  const sessionActions = useTodaySessionActions(state.sessionId);

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

  // CTA copy:
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

  const isActive = state.mode === 'active';

  return (
    <SessionLayout>
      <StatusBar style="dark" />
      <SessionTopBar
        onBack={() => goTo.home(router)}
        {...(isActive ? { onReset: sessionActions.onRequestReset } : {})}
      />
      <ScrollView
        style={scrollStyle}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <TodayBody
          lift={lift}
          week={progress.data?.week ?? settings.data.week}
          cycle={progress.data?.currentCycle ?? settings.data.currentCycle}
          storageUnit={storageUnit}
          displayUnit={displayUnit}
          tm={tm.data.value}
          plateSet={settings.data.plateSet}
          completedIndices={state.completedIndices}
          nextSetIndex={state.nextSetIndex !== null ? ((state.nextSetIndex + 1) as 1 | 2 | 3) : 1}
          bbbRestTargetSeconds={settings.data.bbbRestTargetSeconds}
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

      <ResetConfirmSheet
        open={sessionActions.resetOpen}
        armed={sessionActions.resetArmed}
        onConfirmFirstTap={sessionActions.onConfirmResetFirstTap}
        onConfirmSecondTap={sessionActions.onConfirmResetSecondTap}
        onDismiss={sessionActions.onDismissResetSheet}
        testID="today-reset-confirm-sheet"
      />
    </SessionLayout>
  );
}
