import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { CapsLabel } from './CapsLabel';

export type LabeledSegRailProps = {
  /** Heading caps label rendered above the rail. */
  label: string;
  /** Optional hint caps label rendered below the rail. */
  hint?: string;
  /** The SegRail (or any selector) the caller composes in. */
  children: ReactNode;
  /** Outer container style  -  falls through to the wrapping View. */
  style?: ViewStyle;
};

/**
 * Compose a heading caps label + selector + optional hint into one
 * consistent block. Replaces the inline `CapsLabel + SegRail + CapsLabel`
 * trio that recurs across Settings sections (Units, RestTarget, etc).
 *
 * The selector is rendered as `children` so callers retain full control
 * over the rail's typing  -  this primitive cannot know which option
 * generic the rail uses.
 */
export function LabeledSegRail({ label, hint, children, style }: LabeledSegRailProps) {
  const { spacing } = useTheme();
  return (
    <View style={style}>
      <CapsLabel
        size="xs"
        weight="semibold"
        style={{ marginTop: spacing.md, marginBottom: spacing.sm }}
      >
        {label}
      </CapsLabel>
      {children}
      {hint ? (
        <CapsLabel size="xs" color="ink3" style={{ marginTop: spacing.sm }}>
          {hint}
        </CapsLabel>
      ) : null}
    </View>
  );
}
