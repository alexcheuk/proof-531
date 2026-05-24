import { goTo } from '@/app/routes';
import { useLatestTm } from '@/data/queries/useLatestTm';
import { useSettings } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { liftDisplayName } from '@/domain/labels';
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
  const state = useTodayScreenState(lift);
  const { colors } = useTheme();

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
  // is empty and how to fix it. A blank canvas reads as "broken app".
  if (!settings.data || !tm.data) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
        <SessionTopBar onBack={() => router.back()} />
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
  //   active (>=1 log)       → "Resume session"
  //   preview-other-active   → "Open <other lift> →"
  const ctaLabel =
    state.mode === 'preview'
      ? 'Begin session'
      : state.mode === 'preview-other-active' && state.otherLift
        ? `Open ${state.otherLift} →`
        : state.completedCount === 0
          ? 'Start session'
          : 'Resume session';
  const ctaGlyph = state.mode === 'active' && state.completedCount > 0 ? '↩' : '→';

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
          plateSet={settings.data.plateSet}
          completedIndices={state.completedIndices}
          nextSetIndex={state.nextSetIndex !== null ? ((state.nextSetIndex + 1) as 1 | 2 | 3) : 1}
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

function NoTrainingMaxState({
  lift,
  onOpenSettings,
}: {
  lift: Lift;
  onOpenSettings: () => void;
}) {
  const { colors, spacing } = useTheme();
  const wrap: ViewStyle = {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.bg0,
  };
  return (
    <View style={wrap} testID="today-no-tm">
      <CapsLabel style={{ marginBottom: spacing.md }}>No training max set</CapsLabel>
      <Text variant="sans" weight="bold" size={40} color="ink0" style={{ letterSpacing: -1.2 }}>
        Set your {liftDisplayName(lift)}
        <Text variant="sans" weight="bold" size={40} color="amber">
          .
        </Text>
      </Text>
      <Text
        variant="sans"
        weight="regular"
        size={14}
        color="ink2"
        style={{ marginTop: spacing.md, maxWidth: 280, lineHeight: 21 }}
      >
        Add a training max in Settings so the program can prescribe today's working sets.
      </Text>
      <View style={{ marginTop: spacing.xl }}>
        <PrimaryPillButton testID="today-open-settings" onPress={onOpenSettings} glyph="→">
          Open settings
        </PrimaryPillButton>
      </View>
    </View>
  );
}
