import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View } from 'react-native';

// Empty slices show a single space so line heights stay stable during the typewriter reveal.
export const PR_CELEBRATION_HERO_TEXT = 'Stronger.';

// Combined eyebrow + hero length — the typewriter walks across both strings as one sequence.
export function prCelebrationTypeLength(eyebrow: string): number {
  return eyebrow.length + PR_CELEBRATION_HERO_TEXT.length;
}

export type PrCelebrationHeroProps = {
  eyebrow?: string;
  /** Characters revealed across combined eyebrow + hero (eyebrow first, then hero). Omit to render fully. */
  typedChars?: number;
};

export function PrCelebrationHero({
  eyebrow = 'YOU HIT A NEW PR',
  typedChars,
}: PrCelebrationHeroProps) {
  const { spacing } = useTheme();

  const totalLen = prCelebrationTypeLength(eyebrow);
  const revealed = typedChars ?? totalLen;
  const eyebrowShown = eyebrow.slice(0, Math.min(eyebrow.length, revealed));
  const heroShown = PR_CELEBRATION_HERO_TEXT.slice(0, Math.max(0, revealed - eyebrow.length));

  return (
    <View>
      <Text
        variant="mono"
        weight="medium"
        size={15}
        color="paperTint55"
        style={{
          lineHeight: 19,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          marginBottom: spacing.md + 2,
        }}
      >
        {eyebrowShown.length > 0 ? eyebrowShown : ' '}
      </Text>

      <Text
        variant="sans"
        weight="bold"
        size={76}
        color="bg0"
        style={{
          // 92 (≈1.21× font size) clears the 'g' descender + amber
          // period without clipping. 82 was too tight on iOS — the
          // line box ended just below the baseline.
          lineHeight: 92,
          letterSpacing: -2.8,
        }}
      >
        {heroShown.length > 0 ? (
          <>
            {heroShown.replace(/\.$/, '')}
            {heroShown.endsWith('.') ? (
              <Text variant="sans" weight="bold" size={76} color="amber" style={{ lineHeight: 92 }}>
                .
              </Text>
            ) : null}
          </>
        ) : (
          ' '
        )}
      </Text>
    </View>
  );
}
