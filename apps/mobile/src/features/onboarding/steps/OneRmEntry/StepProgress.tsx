import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import { View } from 'react-native';

export type StepProgressProps = {
  /** 1-based current step. */
  step: number;
  /** Total step count. */
  total: number;
};

export function StepProgress({ step, total }: StepProgressProps) {
  const { colors, layout, spacing } = useTheme();
  return (
    <Row gap="xs" style={{ paddingHorizontal: layout.gutter, paddingTop: spacing.md + 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: positional progress tick
          key={`tick-${i}`}
          style={{
            flex: 1,
            height: 3,
            backgroundColor: i < step ? colors.ink0 : colors.lineStrong,
          }}
        />
      ))}
    </Row>
  );
}
