import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Pressable, type ViewStyle } from 'react-native';

export interface OnboardingHeaderProps {
  onBack?: (() => void) | undefined;
  label?: string | undefined;
  step?: number | undefined;
  total?: number | undefined;
}

/**
 * Sticky-top header bar for the onboarding wizard. Back arrow on steps
 * 2-4, "531." wordmark on step 1; optional caps label + step counter to
 * the right.
 */
export function OnboardingHeader({ onBack, label, step, total }: OnboardingHeaderProps) {
  const { colors, layout } = useTheme();

  const headerStyle: ViewStyle = {
    paddingHorizontal: layout.gutter,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg0,
  };

  const backButtonStyle: ViewStyle = {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: colors.ink0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  };

  return (
    <Row gap="md" style={headerStyle}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          testID="onboarding-back"
          accessibilityRole="button"
          accessibilityLabel="Back"
          // Expand the 28×28 visual chip to a ≥44pt tap surface (Apple's
          // minimum) without changing its visual mass.
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={backButtonStyle}
        >
          <Text variant="mono" weight="bold" size={12} color="ink0">
            ←
          </Text>
        </Pressable>
      ) : (
        <Row align="baseline">
          <Text variant="mono" weight="bold" size={13} color="ink0" style={{ letterSpacing: 1.82 }}>
            531
          </Text>
          <Text variant="mono" weight="bold" size={13} color="ink3">
            .
          </Text>
        </Row>
      )}
      {label ? <CapsLabel>{label}</CapsLabel> : null}
      {step != null && total != null ? (
        <CapsLabel weight="bold" color="ink0" style={{ marginLeft: 'auto' }}>
          {`${String(step).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
        </CapsLabel>
      ) : null}
    </Row>
  );
}
