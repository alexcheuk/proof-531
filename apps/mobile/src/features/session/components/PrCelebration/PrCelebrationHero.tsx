import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Text as RNText, View } from 'react-native';
import Animated, { Easing, FadeIn, ZoomIn } from 'react-native-reanimated';
import { PAPER_65 } from '../PRCertificate/paperTints';

/**
 * The "★ YOU HIT A NEW PR ★" eyebrow + "Stronger." hero pair used at
 * the top of the PR celebration full-screen.
 *
 * Animation cascade — 0 / 80ms — sized to match the rest of the
 * screen's pacing (220 / 320ms for the numbers block in
 * PrCelebrationNumbers). Hero is a ZoomIn-stamp; eyebrow a quick
 * crossfade. No spring — the previous springify(12) read as a
 * drift-in instead of an achievement stamp.
 */
export function PrCelebrationHero() {
  const { colors, spacing, type } = useTheme();

  return (
    <View>
      <Animated.View entering={FadeIn.duration(120).easing(Easing.out(Easing.cubic))}>
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

      <Animated.View entering={ZoomIn.duration(180).delay(80).easing(Easing.out(Easing.cubic))}>
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
          <Text variant="sans" weight="bold" size={76} color="amber" style={{ lineHeight: 82 }}>
            .
          </Text>
        </RNText>
      </Animated.View>
    </View>
  );
}
