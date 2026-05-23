/**
 * 22×22 square ledger checkbox primitive. Behavioral port of the PWA
 * `CheckboxLedger` (src/components/ui/checkbox-ledger.tsx).
 *
 * - unchecked: 1.5px ink-0 border, transparent fill.
 * - checked:   1.5px ink-0 border, ink-0 fill, paper-color ✓ glyph.
 * - disabled:  border softens to ink-3; fill becomes ink-3 when checked.
 *
 * Always renders a Pressable so a11y tooling sees a checkbox target even
 * when no `onChange` is provided (presentational use).
 */

import {
  Pressable,
  Text as RNText,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';

export type CheckboxLedgerProps = {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function CheckboxLedger({
  checked,
  disabled = false,
  onChange,
  testID,
  accessibilityLabel,
  style,
}: CheckboxLedgerProps) {
  const { colors, type } = useTheme();

  const borderColor = disabled ? colors.ink3 : colors.ink0;
  const backgroundColor = checked ? (disabled ? colors.ink3 : colors.ink0) : 'transparent';

  const boxStyle: ViewStyle = {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor,
    backgroundColor,
  };

  const glyphStyle: TextStyle = {
    fontFamily: type.mono,
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 13,
    color: colors.bg0,
  };

  const handlePress = () => {
    if (disabled) return;
    if (onChange) onChange(!checked);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      style={[boxStyle, style]}
    >
      {checked ? <RNText style={glyphStyle}>✓</RNText> : null}
    </Pressable>
  );
}
