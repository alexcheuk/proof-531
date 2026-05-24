import { CapsLabel } from '@/design/primitives/CapsLabel';
import { CtaBar } from '@/design/primitives/CtaBar';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Shared chrome for all four onboarding steps. Ported from
 * `~/Development/531-pwa/src/features/onboarding/components/OnboardingShell.tsx`.
 *
 * Layout (top-to-bottom):
 *   - sticky-ish header strip with optional back-arrow (or wordmark), label,
 *     and optional step counter
 *   - flex content (caller supplies own padding)
 *   - optional sticky-bottom footer (typically a `<PrimaryPillButton>`)
 *
 * Web's `sticky top-0` becomes a fixed-at-top flex header here; web's
 * `mt-auto` becomes the footer placed at the bottom of the flex column.
 */
import type { ReactNode } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';

export interface OnboardingShellProps {
  /** When provided, header shows a back-arrow button. When omitted, shows the wordmark. */
  onBack?: () => void;
  /** Small caps label next to the back-arrow / wordmark. */
  label?: string;
  /** Step counter slots — both must be provided to render the `NN / MM` chip. */
  step?: number;
  total?: number;
  children: ReactNode;
  /** Sticky-bottom slot — typically a `<PrimaryPillButton>`. Omitted on steps with no CTA. */
  footer?: ReactNode;
}

export function OnboardingShell({
  onBack,
  label,
  step,
  total,
  children,
  footer,
}: OnboardingShellProps) {
  const { colors } = useTheme();

  // Top safe-area inset is applied globally by the root layout's SafeTopFrame;
  // don't double-pad here.
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
  };

  return (
    <View style={containerStyle}>
      <Header onBack={onBack} label={label} step={step} total={total} />
      <View style={contentStyle}>{children}</View>
      {footer ? <CtaBar gradient={false}>{footer}</CtaBar> : null}
    </View>
  );
}

interface HeaderProps {
  onBack?: (() => void) | undefined;
  label?: string | undefined;
  step?: number | undefined;
  total?: number | undefined;
}

function Header({ onBack, label, step, total }: HeaderProps) {
  const { colors } = useTheme();

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg0,
    gap: 12,
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
    <View style={headerStyle}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          testID="onboarding-back"
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={backButtonStyle}
        >
          <Text variant="mono" weight="bold" size={12} color="ink0">
            ←
          </Text>
        </Pressable>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text variant="mono" weight="bold" size={13} color="ink0" style={{ letterSpacing: 1.82 }}>
            531
          </Text>
          <Text variant="mono" weight="bold" size={13} color="ink3">
            .
          </Text>
        </View>
      )}
      {label ? <CapsLabel>{label}</CapsLabel> : null}
      {step != null && total != null ? (
        <CapsLabel weight="bold" color="ink0" style={{ marginLeft: 'auto' }}>
          {`${String(step).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
        </CapsLabel>
      ) : null}
    </View>
  );
}
