import { goTo } from '@/app/routes';
import { useDb } from '@/data/DbProvider';
import { appendSetLog } from '@/data/accessors/setLog';
import { LIFETIME_VOLUME_KEY } from '@/data/queries/useLifetimeVolume';
import { SESSION_KEY, useSession } from '@/data/queries/useSession';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import { SET_LOGS_FOR_SESSION_KEY } from '@/data/queries/useSetLogsForSession';
import { useSettings } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { CtaBar } from '@/design/primitives/CtaBar';
import { CtaBarReserve } from '@/design/primitives/CtaBarReserve';
import { Divider } from '@/design/primitives/Divider';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SecondaryLink } from '@/design/primitives/SecondaryLink';
import { Text } from '@/design/primitives/Text';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { BBB_REPS, BBB_SETS, bbbWeightFromTm } from '@/domain/bbb';
import { liftDisplayName } from '@/domain/labels';
import { decompose, defaultPlateSet } from '@/domain/plates';
import { formatMmSs } from '@/domain/time';
import type { Lift, PlateSet, Unit } from '@/domain/types';
import { convertWeight, displayUnit as displayUnitGlyph } from '@/domain/units';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SessionLayout } from './components/SessionLayout';
import { useHardwareBack } from './hooks/useHardwareBack';

/**
 * Shown automatically after AMRAP — between the live set and the
 * SessionComplete receipt — so the user sees their Boring But Big plan
 * (5×10 @ 50% TM) before closing the day. Two CTAs:
 *
 *   - Primary "Mark BBB complete →" — writes 5 set_logs with
 *     `kind: 'bbb'` (each 10 reps at 50% TM) and routes to the
 *     receipt. The session row is already `status = completed`
 *     by this point (`completeSession` ran inside
 *     `useLogWorkingSets.onSaveAmrap` after the AMRAP set), so this is
 *     purely additive — closing the day still works the same way.
 *   - Secondary "Skip · close the day" — routes to the receipt
 *     without writing the BBB rows. Captures "I did the AMRAP but
 *     skipped the back-off work today" honestly.
 *
 * Both paths land on `/session/complete?sessionId=…`.
 */
export type BbbPromptScreenProps = {
  sessionId: number;
};

export function BbbPromptScreen({ sessionId }: BbbPromptScreenProps) {
  const { colors, spacing } = useTheme();
  const sessionQuery = useSession(sessionId);
  const settingsQuery = useSettings();
  const db = useDb();
  const queryClient = useQueryClient();
  const [logging, setLogging] = useState(false);

  const router = useRouter();

  // Android hardware back from /session/bbb should land on the receipt
  // (the user has already finished AMRAP; this is a post-completion
  // surface). The expo-router stack default would re-enter /session/live,
  // which would see status=completed and bounce home — a regression.
  useHardwareBack({
    enabled: true,
    onBack: () => goTo.complete(router, sessionId, { replace: true }),
  });

  if (!sessionQuery.data || !settingsQuery.data) {
    return (
      <SessionLayout testID="bbb-loading">
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }

  const session = sessionQuery.data;
  const settings = settingsQuery.data;
  const lift = session.lift as Lift;
  const storageUnit: Unit = session.storageUnitSnapshot ?? 'lbs';
  const renderUnit: Unit = session.displayUnitSnapshot ?? storageUnit;
  const plateSet: PlateSet = settings.plateSet ?? defaultPlateSet(storageUnit);

  const bbbWeightStorage = bbbWeightFromTm(session.trainingMaxSnapshot, storageUnit);
  const bbbWeightDisplay = Math.round(convertWeight(bbbWeightStorage, storageUnit, renderUnit));
  const perSide = decompose(bbbWeightStorage, plateSet).perSide;
  const restHint = formatMmSs(settings.bbbRestTargetSeconds);

  const onSkip = () => goTo.complete(router, sessionId, { replace: true });

  const onMarkComplete = async () => {
    if (logging) return;
    setLogging(true);
    try {
      // Write the 5 BBB rows at the BBB weight + reps. Use the session's
      // STORAGE-unit weight so the receipt + history-volume math is
      // consistent with the working-set rows (which also persist in
      // storage units). `actualReps === prescribedReps` — we don't ask
      // the user how many they hit on each BBB set (yet); this captures
      // the "I did all 5 sets of 10" intent as the receipt's source of
      // truth.
      for (let i = 0; i < BBB_SETS; i += 1) {
        await appendSetLog(db, {
          sessionId,
          index: i,
          kind: 'bbb',
          prescribedWeight: bbbWeightStorage,
          prescribedReps: BBB_REPS,
          actualReps: BBB_REPS,
        });
      }
      // Refresh the session-shaped surface so the receipt's volume +
      // History tab's lifetime-volume stat pick up the new rows on
      // arrival. `SESSION_KEY` is also re-invalidated so the per-session
      // cache cannot land at /session/complete with a stale
      // `'in_progress'` status (Discord 1508935260 root cause —
      // `SessionCompleteScreen` used to bounce home on a stale read).
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId) }),
        queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
        queryClient.invalidateQueries({ queryKey: SESSION_KEY(sessionId) }),
        queryClient.invalidateQueries({ queryKey: LIFETIME_VOLUME_KEY }),
      ]);
    } catch (err) {
      // Don't block close on failure — the user already did the work.
      // Log the error and route on so they aren't stuck mid-flow.
      console.error('BbbPromptScreen.onMarkComplete failed', err);
    } finally {
      setLogging(false);
      goTo.complete(router, sessionId, { replace: true });
    }
  };

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  return (
    <SessionLayout testID="bbb-prompt">
      <StatusBar style="dark" />
      <ScrollView
        testID="bbb-scroll"
        style={scrollStyle}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <TitleBlock eyebrow={`${liftDisplayName(lift)} · supplementary`} title="Boring But Big." />

        <Divider />

        <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.lg }}>
          <TopSetBlock
            eyebrow={`${BBB_SETS} sets of ${BBB_REPS} · 50% TM`}
            weight={bbbWeightDisplay}
            unitGlyph={displayUnitGlyph(renderUnit)}
            reps={BBB_REPS}
            amrap={false}
            perSide={perSide}
            plateVariant="full"
            bordered={false}
            testID="bbb-plan-topset"
          />
          <Text
            variant="sans"
            weight="regular"
            size={13}
            color="ink3"
            style={{ marginTop: spacing.md }}
          >
            Same bar, same plates, every set.
          </Text>
          <CapsLabel
            size="xs"
            color="ink3"
            style={{ marginTop: spacing.xs, letterSpacing: 1.4 }}
            testID="bbb-rest-hint"
          >
            {`REST ${restHint} BETWEEN SETS`}
          </CapsLabel>
        </View>

        <Divider />

        <CtaBarReserve />
      </ScrollView>

      <CtaBar>
        <View style={{ gap: spacing.sm }}>
          <PrimaryPillButton
            testID="bbb-mark-done"
            glyph="→"
            onPress={() => void onMarkComplete()}
            disabled={logging}
          >
            Mark BBB complete
          </PrimaryPillButton>
          <SecondaryLink
            testID="bbb-skip"
            onPress={onSkip}
            accessibilityLabel="Skip BBB and close the day"
          >
            SKIP · CLOSE THE DAY
          </SecondaryLink>
        </View>
      </CtaBar>
    </SessionLayout>
  );
}
