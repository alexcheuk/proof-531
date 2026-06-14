// The first themed text input in the system: a bordered, multiline, scrollable
// paste surface styled to the e-ink palette (bg3 surface, line border, mono font,
// ink3 placeholder). Lives here so the hex/px discipline stays inside design/.
import { TextInput, type TextStyle } from 'react-native';
import { useTheme } from '../theme';

export type PasteFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  // Orthogonal sizing modifier, not a variant  -  callers set how tall the
  // resting field is before it scrolls internally.
  minLines?: number;
  editable?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

// Mono line-height for the field; sizes the resting height via minLines.
const LINE_HEIGHT = 18;

export function PasteField({
  value,
  onChangeText,
  placeholder,
  minLines = 7,
  editable = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: PasteFieldProps) {
  const { colors, spacing, radii, type } = useTheme();

  const inputStyle: TextStyle = {
    backgroundColor: colors.bg3,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: LINE_HEIGHT * minLines + spacing.sm * 2,
    color: colors.ink0,
    fontFamily: type.mono,
    fontSize: 12,
    lineHeight: LINE_HEIGHT,
    opacity: editable ? 1 : 0.5,
  };

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.ink3}
      editable={editable}
      multiline
      scrollEnabled
      textAlignVertical="top"
      autoCorrect={false}
      autoCapitalize="none"
      spellCheck={false}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={inputStyle}
      {...(testID !== undefined ? { testID } : {})}
    />
  );
}
