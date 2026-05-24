import { CapsLabel } from '@/design/primitives/CapsLabel';

/**
 * Masthead right-slot caps for the date. Slightly tighter letter-spacing
 * than the default 2.2 to match the PWA's 0.18em-on-10px caps treatment
 * for date stamps specifically.
 */
export function DateBadge({ label }: { label: string }) {
  return <CapsLabel style={{ letterSpacing: 1.8 }}>{label}</CapsLabel>;
}
