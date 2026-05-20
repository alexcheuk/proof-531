import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { View, type ViewStyle } from 'react-native';
import type { TodaySession } from './LiveScreen';

export type RestPhaseProps = {
  targetSeconds: number;
  nextSet?: TodaySession['sets'][number] | undefined;
  unit: 'lbs' | 'kg';
  elapsed: number;
  onNext: () => void;
};

const CONTAINER: ViewStyle = {
  flex: 1,
  backgroundColor: colors.bg0,
  padding: shape.rLg,
  alignItems: 'center',
  justifyContent: 'center',
  gap: shape.rLg,
};

const ROW: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'baseline',
  gap: shape.rSm,
};

function formatElapsed(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RestPhase({ targetSeconds, nextSet, unit, elapsed, onNext }: RestPhaseProps) {
  return (
    <View style={CONTAINER} testID="rest-phase">
      <Caps>rest</Caps>
      <Text variant="title">{formatElapsed(elapsed)}</Text>
      <Caps>{`target ${targetSeconds}s`}</Caps>
      {nextSet ? (
        <Card testID="rest-next-set">
          <Caps>up next</Caps>
          <View style={ROW}>
            <WeightNum value={nextSet.prescribedWeight} size="sm" />
            <Caps>{unit}</Caps>
            <Caps>{`× ${nextSet.prescribedReps}${nextSet.amrap ? '+' : ''}`}</Caps>
          </View>
        </Card>
      ) : null}
      <PressButton onPress={onNext} variant="ember" size="lg">
        Next set
      </PressButton>
    </View>
  );
}
