import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Text as RNText, View } from 'react-native';
import { PAPER_55 } from '../PRCertificate/paperTints';

/**
 * The "YOU HIT A NEW {LIFT} PR" eyebrow + "Stronger." hero pair at the
 * top of the PR celebration screen.
 *
 * The intro sequence is orchestrated by the screen — this component
 * exposes `typedChars` so the screen can drive a typewriter reveal in
 * place (rather than from a separate overlay). When `typedChars` is
 * undefined, both texts render fully.
 *
 * To keep the line heights stable during the typewriter (so layout
 * doesn't jump as each line gains characters), empty slices render a
 * single space — the line height stays at the final value regardless
 * of how much of the string has been revealed.
 */
export const PR_CELEBRATION_HERO_TEXT = 'Stronger.';

/**
 * Helper for the orchestrator — the typewriter walks across the
 * combined eyebrow + hero text, so it needs both lengths to know how
 * many ticks the full reveal takes.
 */
export function prCelebrationTypeLength(eyebrow: string): number {
  return eyebrow.length + PR_CELEBRATION_HERO_TEXT.length;
}

export type PrCelebrationHeroProps = {
  /**
   * Eyebrow caps line. Defaults to "YOU HIT A NEW PR" — the screen
   * passes the lift-specific variant ("YOU HIT A NEW SQUAT PR" etc.)
   * once it has resolved the session row.
   */
  eyebrow?: string;
  /**
   * Number of characters revealed across the combined eyebrow + hero
   * text (eyebrow consumes the first `eyebrow.length` characters, the
   * hero takes the rest). Omit to render fully.
   */
  typedChars?: number;
};

export function PrCelebrationHero({
  eyebrow = 'YOU HIT A NEW PR',
  typedChars,
}: PrCelebrationHeroProps) {
  const { colors, spacing, type } = useTheme();

  const totalLen = prCelebrationTypeLength(eyebrow);
  const revealed = typedChars ?? totalLen;
  const eyebrowShown = eyebrow.slice(0, Math.min(eyebrow.length, revealed));
  const heroShown = PR_CELEBRATION_HERO_TEXT.slice(0, Math.max(0, revealed - eyebrow.length));

  return (
    <View>
      <RNText
        style={{
          fontFamily: `${type.mono}-Medium`,
          fontSize: 18,
          lineHeight: 22,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: PAPER_55,
          marginBottom: spacing.md + 2,
        }}
      >
        {eyebrowShown.length > 0 ? eyebrowShown : ' '}
      </RNText>

      <RNText
        style={{
          fontFamily: `${type.display}-Bold`,
          fontSize: 76,
          lineHeight: 82,
          letterSpacing: -2.8,
          color: colors.bg0,
        }}
      >
        {heroShown.length > 0 ? (
          <>
            {heroShown.replace(/\.$/, '')}
            {heroShown.endsWith('.') ? (
              <Text variant="sans" weight="bold" size={76} color="amber" style={{ lineHeight: 82 }}>
                .
              </Text>
            ) : null}
          </>
        ) : (
          ' '
        )}
      </RNText>
    </View>
  );
}
