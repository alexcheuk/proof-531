import { goTo } from '@/app/routes';
import { useSession } from '@/data/queries/useSession';
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
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SessionLayout } from './components/SessionLayout';
import { useHardwareBack } from './hooks/useHardwareBack';

/**
 * Shown automatically after AMRAP — between the live set and the
 * SessionComplete receipt — so the user sees their Boring But Big plan
 * (5×10 @ 50% TM) before closing the day. Two CTAs:
 *
 *   - Primary "Mark BBB complete →" — closes the day on the receipt
 *     (BBB logging itself is not yet implemented; the CTA records
 *     intent for now).
 *   - Secondary "Skip · close the day" — also routes to the receipt
 *     without marking BBB done.
 *
 * Both paths land on `/session/complete?sessionId=…`. The session row is
 * already in `completed` state by the time we arrive (completeSession ran
 * inside `useLogWorkingSets.onSaveAmrap`).
 */
export type BbbPromptScreenProps = {
  sessionId: number;
};

export function BbbPromptScreen({ sessionId }: BbbPromptScreenProps) {
  const { colors, spacing } = useTheme();
  const sessionQuery = useSession(sessionId);
  const settingsQuery = useSettings();

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
  const restHint = formatMmSs(settings.restTargetSeconds);

  const onClose = () => goTo.complete(router, sessionId, { replace: true });

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
          <PrimaryPillButton testID="bbb-mark-done" glyph="→" onPress={onClose}>
            Mark BBB complete
          </PrimaryPillButton>
          <SecondaryLink
            testID="bbb-skip"
            onPress={onClose}
            accessibilityLabel="Skip BBB and close the day"
          >
            SKIP · CLOSE THE DAY
          </SecondaryLink>
        </View>
      </CtaBar>
    </SessionLayout>
  );
}
