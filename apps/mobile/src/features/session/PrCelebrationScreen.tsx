import { goTo } from '@/app/routes';
import { SecondaryLink } from '@/design/primitives/SecondaryLink';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { formatWeight } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text as RNText, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CornerTicks } from './components/PRCertificate/CornerTicks';
import { PAPER_28, PAPER_45, PAPER_55, PAPER_65 } from './components/PRCertificate/paperTints';
import { useHardwareBack } from './hooks/useHardwareBack';
import { useSessionCompleteData } from './hooks/useSessionCompleteData';

/**
 * Full-screen, inverted-color celebration shown right after an AMRAP
 * set that registers a new estimated 1RM PR.
 *
 * Visually mirrors the PR certificate so the celebration screen and the
 * later receipt cert read as the same artifact at two scales:
 *   - same ink-0 surface + corner ticks
 *   - same eyebrow + hero typography
 *   - same hero-number / comparison-row layout
 *
 * Escapes the root SafeTopFrame's paper-bg top stripe with a negative
 * margin so the ink-0 surface extends behind the status bar — light-mode
 * glyphs render cleanly on the dark canvas without a paper sliver above.
 *
 * Primary CTA "Continue →" replace-routes to the BBB prompt; secondary
 * "Skip to receipt" jumps past BBB straight to the session-complete
 * receipt. Android hardware back also pushes forward.
 */
export type PrCelebrationScreenProps = {
  sessionId: number;
};

export function PrCelebrationScreen({ sessionId }: PrCelebrationScreenProps) {
  const { colors, spacing, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = useSessionCompleteData(sessionId);

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const onContinue = () => goTo.bbb(router, sessionId, { replace: true });
  const onSkipToReceipt = () => goTo.complete(router, sessionId, { replace: true });

  useHardwareBack({ enabled: true, onBack: onContinue });

  const v = data.view;

  // Escape the root SafeTopFrame's paper top stripe so the ink-0 canvas
  // runs edge-to-edge under the status bar.
  const surfaceStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.ink0,
    marginTop: -insets.top,
    paddingTop: insets.top,
  };

  const bodyStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
    justifyContent: 'center',
  };

  const ctaWrap: ViewStyle = {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + insets.bottom / 2,
    gap: spacing.xs,
  };

  const hasComparison = !!v && v.prevE1RMDisplay > 0 && v.e1RMDelta > 0;

  return (
    <View style={surfaceStyle} testID="pr-celebration">
      <StatusBar style="light" />
      {/* Corner-tick frame that mirrors the PR certificate panel — but at
          screen scale, so the celebration reads as one big certificate. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: insets.top + spacing.md,
          left: spacing.md,
          right: spacing.md,
          bottom: spacing.md,
        }}
      >
        <CornerTicks color={colors.bg0} />
      </View>

      <View style={bodyStyle}>
        <Animated.View entering={FadeIn.duration(180)}>
          <RNText
            style={{
              fontFamily: `${type.mono}-Bold`,
              fontSize: 11,
              letterSpacing: 2.8,
              textTransform: 'uppercase',
              color: PAPER_65,
              marginBottom: spacing.md + 2,
            }}
          >
            {'★  YOU HIT A NEW PR  ★'}
          </RNText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(240).delay(60).springify().damping(12)}
        >
          <RNText
            style={{
              fontFamily: `${type.display}-Bold`,
              fontSize: 76,
              lineHeight: 82,
              letterSpacing: -2.8,
              color: colors.bg0,
            }}
          >
            Stronger
            <Text
              variant="sans"
              weight="bold"
              size={76}
              color="amber"
              style={{ lineHeight: 82 }}
            >
              .
            </Text>
          </RNText>
        </Animated.View>

        {v ? (
          <>
            <Animated.View
              entering={FadeInDown.duration(240).delay(140).springify().damping(12)}
              style={{
                marginTop: spacing.xl,
                paddingTop: spacing.lg,
                borderTopWidth: 1,
                borderTopColor: PAPER_28,
              }}
              testID="pr-celebration-numbers"
            >
              <RNText
                style={{
                  fontFamily: `${type.mono}-Medium`,
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: PAPER_55,
                }}
              >
                {`${v.liftLower.toUpperCase()} · ESTIMATED 1RM`}
              </RNText>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
                <RNText
                  style={{
                    fontFamily: `${type.display}-Bold`,
                    fontSize: 64,
                    lineHeight: 70,
                    letterSpacing: -2.2,
                    color: colors.bg0,
                  }}
                  testID="pr-celebration-e1rm"
                >
                  {formatWeight(v.e1RMDisplay)}
                </RNText>
                <RNText
                  style={{
                    fontFamily: `${type.mono}-Bold`,
                    fontSize: 13,
                    letterSpacing: 2.6,
                    textTransform: 'uppercase',
                    color: colors.bg0,
                    marginLeft: spacing.sm,
                  }}
                >
                  {v.unitGlyph}
                </RNText>
              </View>
            </Animated.View>

            {hasComparison ? (
              <Animated.View
                entering={FadeInDown.duration(240).delay(220).springify().damping(12)}
                style={{
                  marginTop: spacing.md,
                  paddingTop: spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: PAPER_28,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <View>
                  <RNText
                    style={{
                      fontFamily: `${type.mono}-SemiBold`,
                      fontSize: 9,
                      letterSpacing: 1.98,
                      textTransform: 'uppercase',
                      color: PAPER_55,
                      marginBottom: 4,
                    }}
                  >
                    Previous best
                  </RNText>
                  <RNText
                    style={{
                      fontFamily: `${type.display}-Medium`,
                      fontSize: 22,
                      color: PAPER_45,
                      letterSpacing: -0.44,
                      textDecorationLine: 'line-through',
                      textDecorationColor: PAPER_45,
                    }}
                    testID="pr-celebration-prev"
                  >
                    {`${formatWeight(v.prevE1RMDisplay)} ${v.unitGlyph}`}
                  </RNText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <RNText
                    style={{
                      fontFamily: `${type.mono}-SemiBold`,
                      fontSize: 9,
                      letterSpacing: 1.98,
                      textTransform: 'uppercase',
                      color: PAPER_55,
                      marginBottom: 4,
                    }}
                  >
                    Stronger by
                  </RNText>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <RNText
                      style={{
                        fontFamily: `${type.display}-Bold`,
                        fontSize: 32,
                        lineHeight: 32,
                        letterSpacing: -0.96,
                        color: colors.bg0,
                      }}
                      testID="pr-celebration-delta"
                    >
                      {`+${formatWeight(v.e1RMDelta)}`}
                    </RNText>
                    <RNText
                      style={{
                        fontFamily: `${type.mono}-Bold`,
                        fontSize: 11,
                        letterSpacing: 2.2,
                        textTransform: 'uppercase',
                        color: colors.bg0,
                        marginLeft: 4,
                      }}
                    >
                      {v.unitGlyph}
                    </RNText>
                  </View>
                </View>
              </Animated.View>
            ) : null}
          </>
        ) : (
          // Pre-data skeleton so the screen never reads as a blank
          // headline. The hero number slot stays present (with a paper-tint
          // placeholder underline) until useSessionCompleteData resolves.
          <Animated.View
            entering={FadeIn.duration(180).delay(140)}
            testID="pr-celebration-skeleton"
            style={{
              marginTop: spacing.xl,
              paddingTop: spacing.lg,
              borderTopWidth: 1,
              borderTopColor: PAPER_28,
              opacity: 0.45,
            }}
          >
            <View
              style={{
                height: 12,
                width: 140,
                backgroundColor: PAPER_28,
                marginBottom: 14,
              }}
            />
            <View style={{ height: 56, width: 220, backgroundColor: PAPER_45 }} />
          </Animated.View>
        )}
      </View>

      <View style={ctaWrap}>
        <Pressable
          testID="pr-celebration-continue"
          accessibilityRole="button"
          accessibilityLabel="Continue to Boring But Big"
          onPress={onContinue}
          style={({ pressed }) => ({
            backgroundColor: colors.bg0,
            paddingVertical: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text variant="sans" weight="bold" size={15} color="ink0" style={{ letterSpacing: 0.4 }}>
            {'Continue  →'}
          </Text>
        </Pressable>
        <SecondaryLink
          testID="pr-celebration-skip"
          onPress={onSkipToReceipt}
          surface="inverse"
          accessibilityLabel="Skip to session receipt"
        >
          SKIP TO RECEIPT
        </SecondaryLink>
      </View>
    </View>
  );
}
