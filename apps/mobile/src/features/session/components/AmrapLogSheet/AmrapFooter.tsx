import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Pressable, type ViewStyle } from 'react-native';

export type AmrapFooterProps = {
  pending: boolean;
  onCancel: () => void;
  onSave: () => void;
};

/**
 * Cancel + Save button pair shown at the bottom of the AMRAP sheet.
 * Both fade to 60% opacity while a save is in flight.
 */
export function AmrapFooter({ pending, onCancel, onSave }: AmrapFooterProps) {
  const { colors, spacing } = useTheme();
  const button = (variant: 'primary' | 'ghost'): ViewStyle => ({
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variant === 'primary' ? colors.ink0 : 'transparent',
    borderWidth: 1,
    borderColor: colors.ink0,
    opacity: pending ? 0.6 : 1,
  });

  return (
    <Row gap="md" style={{ marginTop: spacing.lg }}>
      <Pressable
        testID="amrap-cancel"
        accessibilityRole="button"
        accessibilityLabel="Cancel and close the AMRAP sheet"
        disabled={pending}
        onPress={onCancel}
        style={button('ghost')}
      >
        <Text
          variant="sans"
          weight="semibold"
          size={13}
          color="ink0"
          style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          Cancel
        </Text>
      </Pressable>
      <Pressable
        testID="amrap-save"
        accessibilityRole="button"
        accessibilityLabel="Save AMRAP reps"
        disabled={pending}
        onPress={onSave}
        style={button('primary')}
      >
        <Text
          variant="sans"
          weight="semibold"
          size={13}
          color="bg0"
          style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
        >
          Save
        </Text>
      </Pressable>
    </Row>
  );
}
