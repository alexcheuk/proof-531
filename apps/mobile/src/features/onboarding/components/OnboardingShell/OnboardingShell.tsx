import { CtaBar } from '@/design/primitives/CtaBar';
import { useTheme } from '@/design/theme';
import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { OnboardingHeader } from './OnboardingHeader';

/**
 * Shared chrome for all four onboarding steps.
 *
 * Layout (top-to-bottom):
 *   - sticky-ish header strip with optional back-arrow (or wordmark), label,
 *     and optional step counter
 *   - flex content (caller supplies own padding)
 *   - optional sticky-bottom footer (typically a `<PrimaryPillButton>`)
 */
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

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.bg0,
  };

  return (
    <View style={containerStyle}>
      <OnboardingHeader onBack={onBack} label={label} step={step} total={total} />
      <View style={{ flex: 1 }}>{children}</View>
      {footer ? <CtaBar>{footer}</CtaBar> : null}
    </View>
  );
}
