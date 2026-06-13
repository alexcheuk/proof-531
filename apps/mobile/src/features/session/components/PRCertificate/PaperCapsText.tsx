import { useTheme } from '@/design/theme';
import type { ReactNode } from 'react';
import { Text as RNText, type TextStyle } from 'react-native';
import { PAPER_45, PAPER_55, PAPER_65 } from './paperTints';

// Lives next to the certificate (not in src/design/primitives/) because the paper tints are
// specific to the inverted-ink panel  -  no consumers outside this directory.
export type PaperCapsTextProps = {
  children: ReactNode;
  /** Visual weight bucket. */
  variant?: 'eyebrow' | 'label' | 'unit' | 'caption';
  /** Override the default tone (the variant already picks a sensible one). */
  tone?: 'paper' | 'paper-65' | 'paper-55' | 'paper-45';
  style?: TextStyle;
};

const VARIANT_SIZE: Record<NonNullable<PaperCapsTextProps['variant']>, number> = {
  eyebrow: 10,
  label: 9,
  unit: 13,
  caption: 9,
};

const VARIANT_TRACKING: Record<NonNullable<PaperCapsTextProps['variant']>, number> = {
  eyebrow: 2.8,
  label: 1.98,
  unit: 2.6,
  caption: 1.62,
};

const VARIANT_WEIGHT: Record<
  NonNullable<PaperCapsTextProps['variant']>,
  'Bold' | 'SemiBold' | 'Medium'
> = {
  eyebrow: 'Bold',
  label: 'SemiBold',
  unit: 'Bold',
  caption: 'Medium',
};

export function PaperCapsText({ children, variant = 'label', tone, style }: PaperCapsTextProps) {
  const { colors, type } = useTheme();
  const resolvedTone = tone ?? defaultToneFor(variant);
  const color =
    resolvedTone === 'paper'
      ? colors.bg0
      : resolvedTone === 'paper-65'
        ? PAPER_65
        : resolvedTone === 'paper-55'
          ? PAPER_55
          : PAPER_45;

  return (
    <RNText
      style={[
        {
          fontFamily: `${type.mono}-${VARIANT_WEIGHT[variant]}`,
          fontSize: VARIANT_SIZE[variant],
          letterSpacing: VARIANT_TRACKING[variant],
          textTransform: 'uppercase',
          color,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

function defaultToneFor(
  variant: NonNullable<PaperCapsTextProps['variant']>,
): NonNullable<PaperCapsTextProps['tone']> {
  switch (variant) {
    case 'eyebrow':
      return 'paper-65';
    case 'label':
      return 'paper-55';
    case 'unit':
      return 'paper';
    case 'caption':
      return 'paper-55';
  }
}
