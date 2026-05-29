import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Sticky top action row for session screens (Today / Live).
 *
 * Back chip on the left, optional right-side action:
 * nothing or a Complete-session pill (see `CompletePill`).
 *
 * Visual contract:
 *   - bg-bg-0 surface, bottom hairline `colors.line`.
 *   - 24px horizontal padding, ~14px vertical padding to match the PWA mass.
 *   - Back chip: 32×32, ink-0 border, mono `←` glyph.
 */
import { Pressable, View, type ViewStyle } from 'react-native';
import { CompletePill } from './CompletePill';
import { ResetPill } from './ResetPill';
import { UndoPill } from './UndoPill';

export type RightAction = { kind: 'none' } | { kind: 'complete'; onPress: () => void };

export type SessionTopBarProps = {
  /** Pressed when the user taps the back chip. */
  onBack: () => void;
  /** ARIA label for the back chip — visible glyph is always `←`. */
  backLabel?: string;
  /** Right-side action — defaults to `{ kind: 'none' }`. */
  rightAction?: RightAction;
  /**
   * Optional "↶ Undo" pill rendered just left of the primary right action.
   * Used on Live during rest so the user can roll back the most recent
   * working set without leaving the top bar. Omit to hide entirely.
   */
  onUndo?: () => void;
  /**
   * Optional "↺ Restart" pill rendered between Undo and the primary right
   * action. Used on Live to surface the wipe-and-start-over flow.
   */
  onReset?: () => void;
  testID?: string;
};

export function SessionTopBar({
  onBack,
  backLabel = 'Back to Home',
  rightAction = { kind: 'none' },
  onUndo,
  onReset,
  testID,
}: SessionTopBarProps) {
  const { colors, layout } = useTheme();

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

  return (
    <View testID={testID} style={containerStyle}>
      <Pressable
        testID="session-back"
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={onBack}
        // Expand the 32×32 visual chip to a ~44pt tap target (Apple's
        // minimum) without changing its visual mass.
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={backStyle}
      >
        <Text variant="mono" weight="semibold" size={13} color="ink0" style={{ lineHeight: 13 }}>
          {'←'}
        </Text>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {onUndo ? <UndoPill onPress={onUndo} /> : null}
        {onReset ? <ResetPill onPress={onReset} /> : null}
        {rightAction.kind === 'complete' ? <CompletePill onPress={rightAction.onPress} /> : null}
      </View>
    </View>
  );
}
