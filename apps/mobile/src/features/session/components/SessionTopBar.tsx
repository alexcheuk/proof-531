import { useTheme } from '@/design/theme';
/**
 * Sticky top action row for session screens (Today / Live).
 *
 * Ported from the PWA `~/Development/531-pwa/src/features/session/components/
 * SessionTopBar.tsx`. Back chip on the left, optional right-side action:
 * nothing, a Cancel pill, or a Complete-session pill.
 *
 * Visual contract:
 *   - bg-bg-0 surface, bottom hairline `colors.line`.
 *   - 24px horizontal padding, ~14px vertical padding to match the PWA mass.
 *   - Back chip: 32×32, ink-0 border, mono `←` glyph.
 *   - Cancel pill: outlined, mono caps.
 *   - Complete-session pill: filled ink-0, inset paper outline (shadow proxy
 *     in RN is approximated by a 2px inner padding ring via borderColor).
 *   - W3.2 — Cancel split: two 32×32 chips (X and overflow `…`) sit on the
 *     right edge. The X chip's tap branches at the caller (immediate cancel
 *     vs confirm sheet); its long-press AND the overflow tap both open the
 *     two-tap destructive sheet. Visual reuses the back-chip style so the
 *     three sit as a balanced trio at the screen's top edges.
 */
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';

export type RightAction =
  | { kind: 'none' }
  | { kind: 'cancel'; onPress: () => void }
  | {
      kind: 'cancel-split';
      onTapCancel: () => void;
      onLongPressCancel: () => void;
      onTapOverflow: () => void;
    }
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
  const { colors, type } = useTheme();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
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
      {rightAction.kind === 'cancel-split' ? (
        <CancelSplit
          onTapCancel={rightAction.onTapCancel}
          onLongPressCancel={rightAction.onLongPressCancel}
          onTapOverflow={rightAction.onTapOverflow}
        />
      ) : null}
      {rightAction.kind === 'complete' ? <CompletePill onPress={rightAction.onPress} /> : null}
    </View>
  );
}

/**
 * W3.2 — Cancel split visual: two 32×32 chips on the right edge of
 * `SessionTopBar`. The X chip carries the primary tap-to-cancel branch
 * (caller decides immediate-cancel vs confirm sheet on tap); long-press
 * always opens the destructive two-tap sheet. The overflow `…` chip is the
 * accessible / visible-overflow path to the same destructive sheet.
 *
 * Hit targets meet ≥44pt via the 32pt visual + 6pt vertical hitSlop top
 * and bottom (visible chip height 32 + hitSlop 12 = 44 ✓).
 */
function CancelSplit({
  onTapCancel,
  onLongPressCancel,
  onTapOverflow,
}: {
  onTapCancel: () => void;
  onLongPressCancel: () => void;
  onTapOverflow: () => void;
}) {
  const { colors, spacing, type } = useTheme();
  const wrapStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  };
  const chipStyle: ViewStyle = {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const glyphStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 13,
    color: colors.ink0,
    lineHeight: 13,
  };
  return (
    <View testID="session-cancel-split" style={wrapStyle}>
      <Pressable
        testID="session-cancel"
        accessibilityRole="button"
        accessibilityLabel="Cancel session"
        accessibilityActions={[{ name: 'longpress', label: 'Force cancel session' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'longpress') onLongPressCancel();
        }}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        onPress={onTapCancel}
        onLongPress={onLongPressCancel}
        delayLongPress={300}
        style={chipStyle}
      >
        <RNText style={glyphStyle}>×</RNText>
      </Pressable>
      <Pressable
        testID="session-cancel-overflow"
        accessibilityRole="button"
        accessibilityLabel="More session actions"
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        onPress={onTapOverflow}
        style={chipStyle}
      >
        <RNText style={glyphStyle}>⋯</RNText>
      </Pressable>
    </View>
  );
}

function CancelPill({ onPress }: { onPress: () => void }) {
  const { colors, type } = useTheme();
  const pillStyle: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 28,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const textStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    color: colors.ink0,
    textTransform: 'uppercase',
  };
  return (
    <Pressable
      testID="session-cancel"
      accessibilityRole="button"
      accessibilityLabel="Cancel session"
      onPress={onPress}
      style={pillStyle}
    >
      <RNText style={textStyle}>Cancel</RNText>
    </Pressable>
  );
}

function CompletePill({ onPress }: { onPress: () => void }) {
  const { colors, type } = useTheme();
  const pillStyle: ViewStyle = {
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 28,
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.ink0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const textStyle: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 10,
    letterSpacing: 2.2,
    color: colors.bg0,
    textTransform: 'uppercase',
  };
  return (
    <Pressable
      testID="session-complete"
      accessibilityRole="button"
      accessibilityLabel="Complete session"
      onPress={onPress}
      style={pillStyle}
    >
      <RNText style={textStyle}>Complete session</RNText>
    </Pressable>
  );
}
