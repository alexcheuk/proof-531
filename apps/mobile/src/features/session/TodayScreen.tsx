import { useDb } from '@/data/DbProvider';
import { appendSetLog } from '@/data/accessors/setLog';
import { useActiveSession } from '@/data/queries/useActiveSession';
import { useLatestTm } from '@/data/queries/useLatestTm';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
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
import { useCallback, useMemo } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SessionLayout } from './components/SessionLayout';
import { SessionTopBar } from './components/SessionTopBar';
import { TodayBody, type WarmupRampRow } from './components/TodayBody';
import { useTodayScreenState } from './hooks/useTodayScreenState';

export function TodayScreen({ lift }: { lift: Lift }) {
  const router = useRouter();
  const settings = useSettings();
  const tm = useLatestTm(lift);
  const { starting, start } = useTodayScreenState(lift);
  const { colors } = useTheme();
  const db = useDb();
  const queryClient = useQueryClient();
  const activeSession = useActiveSession();
  // The warmup-stretch path (W1.2) requires an existing in-progress session
  // for this lift so the row writes can be addressed. If the user landed on
  // Today directly (no createSession yet) we render the rows as static
  // reference text.
  const activeForLift =
    activeSession.data && (activeSession.data.lift as Lift) === lift ? activeSession.data : null;
  const setLogs = useSetLogsForSession(activeForLift?.id ?? null);
  const loggedWarmupIndices = useMemo<number[]>(
    () => (setLogs.data ?? []).filter((l) => l.kind === 'warmup').map((l) => l.index),
    [setLogs.data],
  );

  const handleLogWarmup = useCallback(
    async (row: WarmupRampRow) => {
      if (!activeForLift) return;
      Haptics.selectionAsync();
      try {
        await appendSetLog(db, {
          sessionId: activeForLift.id,
          index: row.negativeIndex,
          kind: 'warmup',
          prescribedWeight: row.prescribedWeight,
          prescribedReps: row.prescribedReps,
          actualReps: row.prescribedReps,
        });
        await queryClient.invalidateQueries({
          queryKey: ['setLogsForSession', activeForLift.id],
        });
      } catch (err) {
        console.error('TodayScreen.handleLogWarmup failed', err);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    },
    [activeForLift, db, queryClient],
  );

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
          plateSet={settings.data.plateSet}
          {...(activeForLift ? { onLogWarmup: handleLogWarmup } : null)}
          loggedWarmupIndices={loggedWarmupIndices}
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
