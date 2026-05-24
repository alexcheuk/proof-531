import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import type { ColorToken } from '../tokens';
import { Text } from './Text';

/**
 * Caps mono label primitive — the one canonical implementation of the
 * "letter-spaced uppercase mono caption" pattern used everywhere in this
 * codebase (Masthead right-slot, section eyebrows, list captions, the
 * "— END OF REGISTER —" colophon).
 *
 * Before this primitive existed, Settings / History / Home / SessionComplete
 * / TodayBody all hand-rolled the same `fontFamily: 'IBMPlexMono-Medium'`,
 * `letterSpacing: 2.2`, `textTransform: 'uppercase'` style inline — that
 * meant every drift incident (color tweak, weight change) had to be fixed
 * in five places. Use this everywhere a caps label is needed.
 *
 * Sizing presets:
 *   - `xs` (9px / 1.62 ls) — colophons, ultra-fine print
 *   - `sm` (10px / 2.2 ls) — default; section eyebrows, masthead right-slot
 *   - `md` (11px / 1.98 ls) — strong eyebrows
 *
 * Pass `weight` to escalate emphasis (medium → semibold → bold).
 */
export type CapsLabelProps = {
  children: ReactNode;
  /** Size preset. Defaults to `sm` (the 10px / 2.2 letter-spacing variant). */
  size?: 'xs' | 'sm' | 'md';
  /** Weight token; defaults to `medium`. */
  weight?: 'medium' | 'semibold' | 'bold';
  /** Ink color token; defaults to `ink2` (tertiary). */
  color?: ColorToken;
  testID?: string;
  /** Escape hatch for one-off spacing/margins — do not pass typography overrides here. */
  style?: StyleProp<TextStyle>;
};

const SIZE_MAP: Record<NonNullable<CapsLabelProps['size']>, { size: number; ls: number }> = {
  xs: { size: 9, ls: 1.62 },
  sm: { size: 10, ls: 2.2 },
  md: { size: 11, ls: 1.98 },
};

export function CapsLabel({
  children,
  size = 'sm',
  weight = 'medium',
  color = 'ink2',
  testID,
  style,
}: CapsLabelProps) {
  const { size: fontSize, ls } = SIZE_MAP[size];
  // Spread testID conditionally — the underlying Text primitive types testID
  // as a required string under exactOptionalPropertyTypes, so passing
  // `testID={undefined}` is a type error.
  return (
    <Text
      variant="mono"
      weight={weight}
      size={fontSize}
      color={color}
      style={[{ textTransform: 'uppercase', letterSpacing: ls }, style]}
      {...(testID !== undefined ? { testID } : {})}
    >
      {children}
    </Text>
  );
}
