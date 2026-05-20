import { Barbell } from '@/design/plates/Barbell';
import { Chips } from '@/design/plates/Chips';
import { Numerical } from '@/design/plates/Numerical';
import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { prescribedSets } from '@/domain/program';
import { Pressable, ScrollView, View } from 'react-native';
import { TodayHeader } from './TodayHeader';
import { type PlateVariant, type TodaySession, WEEK_LABEL } from './today-types';

export type TodayEditorialProps = {
  session: TodaySession;
  plateVariant?: PlateVariant;
  onStartSet?: (index: number) => void;
  onOpenWatch?: () => void;
};

// Embedded plate viz width on the right of the top working set. Sized for an
// at-a-glance preview, not an interactive plate calculator. Mirrors SetCard.
const PLATE_VIZ_WIDTH = shape.rPill / 8; // 999/8 ≈ 124 — close to spec "~120"
const PLATE_VIZ_HEIGHT = shape.weekLabel; // 48 — short row that fits in the card

function PlateViz({
  variant,
  weight,
}: {
  variant: PlateVariant;
  weight: number;
}) {
  if (variant === 'chips') {
    return <Chips weight={weight} width={PLATE_VIZ_WIDTH} height={PLATE_VIZ_HEIGHT} />;
  }
  if (variant === 'numerical') {
    return <Numerical weight={weight} />;
  }
  return <Barbell weight={weight} width={PLATE_VIZ_WIDTH} height={PLATE_VIZ_HEIGHT} />;
}

/**
 * Editorial hero variant of the Today screen — wide, magazine-style title with
 * the lift name + week scheme, prescribed sets listed as a clean stack, AMRAP
 * set highlighted with a larger WeightNum + plate-viz embed for the top
 * working set.
 *
 * Behavioral source: `design-reference/screens-main.jsx` `TodayEditorial`
 * (line 84). If `session.sets` is populated, those drive the UI; otherwise
 * sets are derived from `trainingMax` + `weekOfCycle` via `prescribedSets`.
 */
export function TodayEditorial({
  session,
  plateVariant = 'barbell',
  onStartSet,
  onOpenWatch,
}: TodayEditorialProps) {
  const sets =
    session.sets.length > 0
      ? session.sets
      : prescribedSets(session.trainingMax, session.weekOfCycle).map((s, i) => ({
          index: i,
          type: 'main' as const,
          weight: s.weight,
          reps: s.reps,
          amrap: s.amrap,
          pct: s.percent,
        }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ paddingBottom: shape.rLg }}
      testID="today-editorial"
    >
      {onOpenWatch ? (
        <TodayHeader session={session} onOpenWatch={onOpenWatch} />
      ) : (
        <TodayHeader session={session} />
      )}

      <View style={{ paddingHorizontal: shape.rLg, paddingBottom: shape.rMd }}>
        <Caps>{WEEK_LABEL[session.weekOfCycle]}</Caps>
      </View>

      <View style={{ paddingHorizontal: shape.rLg, gap: shape.rSm }}>
        {sets.map((s, i) => {
          const isTop = i === sets.length - 1;
          return (
            <Pressable
              key={`${session.liftId}-${s.index}`}
              onPress={() => onStartSet?.(i)}
              accessibilityRole="button"
              accessibilityLabel={`Set ${i + 1}, ${s.weight} ${session.unit}, ${s.reps} reps${s.amrap ? ' AMRAP' : ''}`}
              testID={s.amrap ? 'set-amrap' : `set-row-${i}`}
            >
              <Card padded>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: shape.rMd,
                  }}
                >
                  <View style={{ flex: 1, gap: shape.rXs }}>
                    <Caps>{`${Math.round(s.pct * 100)}%`}</Caps>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        gap: shape.rSm,
                      }}
                    >
                      <WeightNum value={s.weight} size={isTop ? 'lg' : 'md'} />
                      <Text variant="small" tone="ink2">
                        {`× ${s.reps}${s.amrap ? '+' : ''} ${session.unit}`}
                      </Text>
                    </View>
                  </View>
                  {isTop ? (
                    <View>
                      <PlateViz variant={plateVariant} weight={s.weight} />
                    </View>
                  ) : null}
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default TodayEditorial;
