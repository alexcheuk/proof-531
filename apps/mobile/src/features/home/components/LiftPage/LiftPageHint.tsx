import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';

export type LiftPageHintProps = {
  /** Hint copy — caller is responsible for upper-casing if desired. */
  children: string;
  testID?: string;
};

// letterSpacing 1.62 is intentionally tighter than CapsLabel xs default so the hint reads as a quiet peer of the title.
export function LiftPageHint({ children, testID }: LiftPageHintProps) {
  const { spacing } = useTheme();
  return (
    <CapsLabel
      size="xs"
      color="ink3"
      style={{ marginTop: spacing.sm, letterSpacing: 1.62 }}
      {...(testID !== undefined ? { testID } : {})}
    >
      {children}
    </CapsLabel>
  );
}
