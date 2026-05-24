import { useTheme } from '@/design/theme';
/**
 * Sticky top action row for session screens (Today / Live).
 *
 * Ported from the PWA `~/Development/531-pwa/src/features/session/components/
 * SessionTopBar.tsx`. Back chip on the left, optional right-side action:
 * nothing, a Cancel pill (see `CancelPill`), or a Complete-session pill
 * (see `CompletePill`).
 *
 * Visual contract:
 *   - bg-bg-0 surface, bottom hairline `colors.line`.
 *   - 24px horizontal padding, ~14px vertical padding to match the PWA mass.
 *   - Back chip: 32×32, ink-0 border, mono `←` glyph.
 */
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { CancelPill } from './CancelPill';
import { CompletePill } from './CompletePill';

export type RightAction =
  | { kind: 'none' }
  | { kind: 'cancel'; onPress: () => void }
  | { kind: 'complete'; onPress: () => void };

export type SessionTopBarProps = {
  /** Pressed when the user taps the back chip. */
  onBack: () => void;
  /** ARIA label for the back chip — visible glyph is always `←`. */
  backLabel?: string;
  /** Right-side action — defaults to `{ kind: 'none' }`. */
  rightAction?: RightAction;
  testID?: string;
};

export function SessionTopBar({
  onBack,
  backLabel = 'Back to Home',
  rightAction = { kind: 'none' },
  testID,
}: SessionTopBarProps) {
  const { colors, layout, type } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    paddingVertical: 14,
    backgroundColor: colors.bg0,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  };

  const backStyle: ViewStyle = {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const backGlyphStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 13,
    color: colors.ink0,
    lineHeight: 13,
  };

  return (
    <View testID={testID} style={containerStyle}>
      <Pressable
        testID="session-back"
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        style={backStyle}
      >
        <RNText style={backGlyphStyle}>{'←'}</RNText>
      </Pressable>
      {rightAction.kind === 'cancel' ? <CancelPill onPress={rightAction.onPress} /> : null}
      {rightAction.kind === 'complete' ? <CompletePill onPress={rightAction.onPress} /> : null}
    </View>
  );
}
