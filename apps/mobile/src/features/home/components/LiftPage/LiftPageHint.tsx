import { CapsLabel } from '@/design/primitives/CapsLabel';
import { useTheme } from '@/design/theme';

export type LiftPageHintProps = {
  /** Hint copy — caller is responsible for upper-casing if desired. */
  children: string;
  testID?: string;
};

/**
 * One-line caps-mono hint rendered below the LiftPage title. Used for
 * deload-week callouts and "last trained" stamps so the styling stays
 * consistent across hint types.
 *
 * Letter-spacing of 1.62 matches the PWA caption mass — close enough to
 * the default `CapsLabel` xs but tightened so the hint reads as a quiet
 * peer of the title rather than a competing label.
 */
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
