import { colors, shape } from '@/design/tokens';
import { ScrollView, View } from 'react-native';
import { SetCard } from './SetCard';
import type { PlateVariant, TodaySession } from './today-types';

export type TodayCardsProps = {
  session: TodaySession;
  plateVariant?: PlateVariant;
  onStartSet?: (index: number) => void;
  onOpenWatch?: () => void;
};

export function TodayCards({ session, plateVariant, onStartSet }: TodayCardsProps) {
  const nextIndex = session.sets.findIndex((s) => !s.done);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ padding: shape.rLg, gap: shape.rMd }}
      testID="today-cards"
    >
      <View style={{ gap: shape.rMd }}>
        {session.sets.map((s, i) => {
          const isNext = !s.done && i === nextIndex;
          const baseProps = {
            index: i,
            weight: s.weight,
            reps: s.reps,
            amrap: s.amrap,
            pct: s.pct,
            unit: session.unit,
            done: s.done === true,
            next: isNext,
          };
          const optionalProps: { plateVariant?: PlateVariant; onPress?: () => void } = {};
          if (plateVariant !== undefined) optionalProps.plateVariant = plateVariant;
          if (isNext) optionalProps.onPress = () => onStartSet?.(i);
          return <SetCard key={`${session.liftId}-${i}`} {...baseProps} {...optionalProps} />;
        })}
      </View>
    </ScrollView>
  );
}

export default TodayCards;
