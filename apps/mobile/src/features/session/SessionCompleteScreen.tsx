/**
 * Session complete screen — the "stamped receipt" surface shown after the
 * Live screen completes (or the Today Complete pill is tapped).
 *
 * Composition shell only — view derivation lives in
 * `useSessionCompleteData`, sub-blocks (masthead, title, PR certificate,
 * receipt, cycle grid) live in their own files. The PR success haptic is
 * fired by `usePrSuccessHaptic`.
 */
import { goTo } from '@/app/routes';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { useTheme } from '@/design/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  Pressable,
  Text as RNText,
  ScrollView,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { CycleGrid } from './components/CycleGrid';
import { PRCertificate } from './components/PRCertificate';
import { ReceiptCard } from './components/ReceiptCard';
import { SessionCompleteMasthead } from './components/SessionCompleteMasthead';
import { SessionCompleteTitle } from './components/SessionCompleteTitle';
import { SessionLayout } from './components/SessionLayout';
import { usePrSuccessHaptic } from './hooks/usePrSuccessHaptic';
import { useSessionCompleteData } from './hooks/useSessionCompleteData';

export type SessionCompleteScreenProps = {
  sessionId: number;
};

export function SessionCompleteScreen({ sessionId }: SessionCompleteScreenProps) {
  const router = useRouter();
  const { colors, type } = useTheme();
  const data = useSessionCompleteData(sessionId);

  usePrSuccessHaptic(data.view?.hasPR ?? false);

  // Defense in depth: deep-link / manual route into this screen for a
  // cancelled or in-progress session bounces home rather than rendering the
  // success masthead over a non-completed session.
  useEffect(() => {
    if (data.loading) return;
    if (data.missing || data.notCompleted) {
      goTo.home(router);
    }
  }, [data.loading, data.missing, data.notCompleted, router]);

  if (!data.view) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }

  const v = data.view;
  const handleClose = () => goTo.home(router);
  const handleAdjustTm = () => goTo.settings(router);

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };
  const secondaryLinkStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  };
  const tmCtaStyle: ViewStyle = {
    marginHorizontal: 24,
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const tmCtaLabel: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink0,
  };
  const tmCtaSub: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginTop: 2,
  };
  const tmCtaChevron: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 16,
    color: colors.ink0,
  };

  return (
    <SessionLayout>
      <StatusBar style="dark" />
      <ScrollView
        testID="session-complete-scroll"
        style={scrollStyle}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <SessionCompleteMasthead />

        <SessionCompleteTitle
          completedThisCycle={v.completedThisCycle}
          eyebrowDate={v.eyebrowDate}
          weekday={v.stampParts.weekday}
          dateLine={v.stampParts.dateLine}
          year={v.stampParts.year}
          showCertificate={v.showCertificate}
          liftLower={v.liftLower}
          week={v.session.week}
        />

        {v.showCertificate ? (
          <>
            <PRCertificate
              testID="session-complete-cert"
              e1RM={v.e1RMDisplay}
              prevE1RM={v.prevE1RMDisplay}
              delta={v.e1RMDelta}
              unit={v.unitGlyph}
              liftLabel={v.liftLower}
            />
            <Pressable
              testID="session-complete-adjust-tm"
              accessibilityRole="button"
              accessibilityLabel="Adjust training max in settings"
              accessibilityHint="Opens settings on the training max section"
              onPress={handleAdjustTm}
              style={({ pressed }) => [tmCtaStyle, pressed ? { opacity: 0.6 } : null]}
            >
              <View>
                <RNText style={tmCtaLabel}>Adjust training max</RNText>
                <RNText style={tmCtaSub}>
                  e1rm jumped {v.e1RMDelta} {v.unitGlyph} — consider a bump
                </RNText>
              </View>
              <RNText style={tmCtaChevron}>›</RNText>
            </Pressable>
          </>
        ) : null}

        <ReceiptCard
          topWeight={v.topWeight}
          topReps={v.topReps}
          topIsAmrap={v.topIsAmrap}
          e1RMDisplay={v.e1RMDisplay}
          workingVolume={v.workingVolume}
          elapsedReady={v.elapsedReady}
          elapsedValue={v.elapsedValue}
          unitGlyph={v.unitGlyph}
        />

        <CycleGrid
          cycle={v.session.cycle ?? 1}
          completedThisCycle={v.completedThisCycle}
          sessionsInCycle={v.sessionsInCycle}
        />

        {/* Reserve room above the sticky CtaBar so receipt isn't clipped. */}
        <View style={{ height: 140 }} />
      </ScrollView>
      <CtaBar>
        <PrimaryPillButton testID="session-complete-close" onPress={handleClose}>
          Close the day
        </PrimaryPillButton>
        <RNText
          testID="session-complete-history-link"
          accessibilityRole="button"
          onPress={() => goTo.home(router)}
          style={secondaryLinkStyle}
        >
          See full record →
        </RNText>
      </CtaBar>
    </SessionLayout>
  );
}
