import { useDb } from '@/data/DbProvider';
import { appendSetLog } from '@/data/accessors/setLog';
import { LIFETIME_VOLUME_KEY } from '@/data/queries/useLifetimeVolume';
import { SESSION_KEY, useSession } from '@/data/queries/useSession';
import { SESSIONS_KEY } from '@/data/queries/useSessions';
import {
  SET_LOGS_FOR_SESSION_KEY,
  useSetLogsForSession,
} from '@/data/queries/useSetLogsForSession';
import { useSettings } from '@/data/queries/useSettings';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { CtaBar } from '@/design/primitives/CtaBar';
import { CtaBarReserve } from '@/design/primitives/CtaBarReserve';
import { Divider } from '@/design/primitives/Divider';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Row } from '@/design/primitives/Row';
import { SecondaryLink } from '@/design/primitives/SecondaryLink';
import { Text } from '@/design/primitives/Text';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { BBB_PCT_OF_TM, BBB_REPS, BBB_SETS, bbbWeightFromTm } from '@/domain/bbb';
import { liftDisplayName } from '@/domain/labels';
import { decompose, defaultPlateSet } from '@/domain/plates';
import { formatMmSs } from '@/domain/time';
import type { Lift, PlateSet, Unit } from '@/domain/types';
import { convert, displayUnit as displayUnitGlyph } from '@/domain/units';
import { goTo } from '@/lib/routes';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SessionLayout } from './components/SessionLayout';
import { SetRow } from './components/SetRow';
import { useHardwareBack } from './hooks/useHardwareBack';

export type BbbPromptScreenProps = {
  sessionId: number;
};

export function BbbPromptScreen({ sessionId }: BbbPromptScreenProps) {
  const { colors, spacing } = useTheme();
  const sessionQuery = useSession(sessionId);
  const settingsQuery = useSettings();
  const setLogsQuery = useSetLogsForSession(sessionId);
  const db = useDb();
  const queryClient = useQueryClient();
  const [logging, setLogging] = useState(false);

  const router = useRouter();

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
  const unitGlyph = displayUnitGlyph(renderUnit);

  const bbbWeightStorage = bbbWeightFromTm(session.trainingMaxSnapshot, storageUnit);
  const bbbWeightDisplay = convert(bbbWeightStorage, storageUnit, renderUnit);
  const perSide = decompose(bbbWeightStorage, plateSet).perSide;
  const restHint = formatMmSs(settings.bbbRestTargetSeconds);

  const completedCount = (setLogsQuery.data ?? []).filter((l) => l.kind === 'bbb').length;
  const allDone = completedCount >= BBB_SETS;
  const remaining = BBB_SETS - completedCount;

  const onClose = () => goTo.complete(router, sessionId, { replace: true });

  const invalidateAll = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: SET_LOGS_FOR_SESSION_KEY(sessionId) }),
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
      queryClient.invalidateQueries({ queryKey: SESSION_KEY(sessionId) }),
      queryClient.invalidateQueries({ queryKey: LIFETIME_VOLUME_KEY }),
    ]);

  const onCompleteOneSet = async () => {
    if (logging || allDone) return;
    setLogging(true);
    try {
      await appendSetLog(db, {
        sessionId,
        index: completedCount,
        kind: 'bbb',
        prescribedWeight: bbbWeightStorage,
        prescribedReps: BBB_REPS,
        actualReps: BBB_REPS,
      });
      await invalidateAll();
    } catch (err) {
      console.error('BbbPromptScreen.onCompleteOneSet failed', err);
    } finally {
      setLogging(false);
    }
  };

  const onMarkAllRemaining = async () => {
    if (logging || allDone) return;
    setLogging(true);
    try {
      for (let i = completedCount; i < BBB_SETS; i += 1) {
        await appendSetLog(db, {
          sessionId,
          index: i,
          kind: 'bbb',
          prescribedWeight: bbbWeightStorage,
          prescribedReps: BBB_REPS,
          actualReps: BBB_REPS,
        });
      }
      await invalidateAll();
    } catch (err) {
      console.error('BbbPromptScreen.onMarkAllRemaining failed', err);
    } finally {
      setLogging(false);
      onClose();
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

        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg }}>
          <TopSetBlock
            eyebrow={`${BBB_SETS} sets of ${BBB_REPS} · ${BBB_PCT_OF_TM * 100}% TM`}
            weight={bbbWeightDisplay}
            unitGlyph={unitGlyph}
            reps={BBB_REPS}
            amrap={false}
            perSide={perSide}
            plateVariant="full"
            bordered={false}
            testID="bbb-plan-topset"
          />
        </View>

        <Divider />

        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg }}>
          <Row justify="space-between" style={{ marginBottom: 6 }}>
            <CapsLabel>
              {completedCount > 0
                ? `BORING BUT BIG · ${completedCount} OF ${BBB_SETS} DONE`
                : 'BORING BUT BIG'}
            </CapsLabel>
            <CapsLabel size="xs" color="ink3" testID="bbb-rest-hint">
              {`REST ${restHint} BETWEEN SETS`}
            </CapsLabel>
          </Row>

          <View>
            {([1, 2, 3, 4, 5] as const).map((setNum) => {
              const isDone = setNum - 1 < completedCount;
              const isNext = !isDone && setNum - 1 === completedCount;
              return (
                <SetRow
                  key={`bbb-set-${setNum}`}
                  index={setNum}
                  isLast={setNum === BBB_SETS}
                  weight={bbbWeightDisplay}
                  unit={renderUnit}
                  reps={BBB_REPS}
                  amrap={false}
                  pct={BBB_PCT_OF_TM}
                  done={isDone}
                  next={isNext}
                  testID={`bbb-set-row-${setNum - 1}`}
                />
              );
            })}
          </View>

          <Text
            variant="sans"
            weight="regular"
            size={13}
            color="ink3"
            style={{ marginTop: spacing.md, marginBottom: spacing.lg }}
          >
            Same bar, same plates, every set.
          </Text>
        </View>

        <Divider />

        <CtaBarReserve />
      </ScrollView>

      <CtaBar>
        <View style={{ gap: spacing.sm }}>
          {allDone ? (
            <PrimaryPillButton testID="bbb-close" glyph="→" onPress={onClose}>
              Close the day
            </PrimaryPillButton>
          ) : (
            <>
              <PrimaryPillButton
                testID="bbb-complete-set"
                glyph="+"
                onPress={() => void onCompleteOneSet()}
                disabled={logging}
              >
                Complete set
              </PrimaryPillButton>
              <SecondaryLink
                testID="bbb-mark-all"
                onPress={() => void onMarkAllRemaining()}
                accessibilityLabel={`Mark ${remaining} of ${BBB_SETS} BBB sets complete`}
              >
                {`MARK ${remaining}/${BBB_SETS} COMPLETE`}
              </SecondaryLink>
              <SecondaryLink
                testID="bbb-skip"
                onPress={onClose}
                accessibilityLabel="Skip BBB and close the day"
              >
                SKIP · CLOSE THE DAY
              </SecondaryLink>
            </>
          )}
        </View>
      </CtaBar>
    </SessionLayout>
  );
}
