import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { View } from 'react-native';

export type LiftPageEyebrowProps = {
  lift: Lift;
  cycle: number;
  isInProgress: boolean;
};

export function LiftPageEyebrow({ lift, cycle, isInProgress }: LiftPageEyebrowProps) {
  const { colors } = useTheme();
  return (
    <Row justify="space-between" gap="sm">
      {/* Week/day dropped — CycleStrip is the sole owner of that fact now. */}
      <CapsLabel weight="semibold">{`Cycle ${cycle}`}</CapsLabel>
      {isInProgress ? (
        <Row gap="xs" testID={`lift-page-${lift}-in-progress`}>
          <View style={{ width: 6, height: 6, backgroundColor: colors.ink0 }} />
          <CapsLabel size="xs" weight="bold" color="ink0" style={{ letterSpacing: 1.98 }}>
            In progress
          </CapsLabel>
        </Row>
      ) : null}
    </Row>
  );
}
