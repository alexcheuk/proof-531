import { Caps } from '@/design/primitives/Caps';
import { colors, shape } from '@/design/tokens';
import { prescribedSets } from '@/domain/program';
import { ScrollView, View } from 'react-native';
import { type AssistanceItem, AssistanceRow } from './AssistanceRow';
import { DataStat } from './DataStat';
import { SetRow } from './SetRow';
import { TodayHeader } from './TodayHeader';
import { type PlateVariant, type TodaySession, type TodaySet, WEEK_LABEL } from './today-types';

export type TodayDataProps = {
  session: TodaySession;
  plateVariant?: PlateVariant;
  onStartSet?: (index: number) => void;
  onOpenWatch?: () => void;
};

const DEFAULT_ASSISTANCE: AssistanceItem[] = [
  { name: 'Dips', category: 'push', sets: 5, reps: 10 },
  { name: 'Chin-ups', category: 'pull', sets: 5, reps: 10 },
  { name: 'Hanging leg raise', category: 'core', sets: 3, reps: 12 },
];

/**
 * Data-dense variant of the Today screen — compact stat strip, a single
 * tabular list of main sets, a BBB row, and a small assistance block.
 *
 * Behavioral source: `design-reference/screens-main.jsx` `TodayData`
 * (line 379). When `session.sets` is empty, main sets are derived from
 * `trainingMax` + `weekOfCycle` via `prescribedSets`. BBB is computed inline
 * (5 × 10 at 50% TM) — there's no dedicated domain helper yet.
 */
export function TodayData({
  session,
  plateVariant: _plateVariant,
  onStartSet,
  onOpenWatch,
}: TodayDataProps) {
  const mainSets: TodaySet[] =
    session.sets.length > 0
      ? session.sets
      : prescribedSets(session.trainingMax, session.weekOfCycle).map((s, i) => ({
          index: i,
          type: 'main',
          weight: s.weight,
          reps: s.reps,
          amrap: s.amrap,
          pct: s.percent,
        }));

  const topSet = mainSets[mainSets.length - 1];
  const nextIndex = mainSets.findIndex((s) => !s.done);

  // BBB: 5 sets × 10 reps at 50% TM. Round to nearest 5 (matches the
  // `roundTo` default used in `prescribedSets`).
  const bbbWeight = Math.round((session.trainingMax * 0.5) / 5) * 5;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ paddingBottom: shape.rLg, gap: shape.rMd }}
      testID="today-data"
    >
      {onOpenWatch ? (
        <TodayHeader session={session} onOpenWatch={onOpenWatch} />
      ) : (
        <TodayHeader session={session} />
      )}

      <View
        style={{ paddingHorizontal: shape.rLg, flexDirection: 'row', gap: shape.rSm }}
        testID="data-stat-strip"
      >
        <DataStat label="Cycle" value={session.cycleNumber} testID="data-stat-cycle" />
        <DataStat label="Week" value={WEEK_LABEL[session.weekOfCycle]} testID="data-stat-week" />
        <DataStat
          label="Top set"
          value={`${topSet?.weight ?? 0}`}
          sub={session.unit}
          mono
          testID="data-stat-top"
        />
        <DataStat
          label="TM"
          value={session.trainingMax}
          sub={session.unit}
          mono
          testID="data-stat-tm"
        />
      </View>

      <View style={{ paddingHorizontal: shape.rLg, gap: shape.rXs }} testID="today-main-section">
        <Caps>Main sets</Caps>
        {mainSets.map((s, i) => {
          const done = s.done === true;
          return (
            <SetRow
              key={`${session.liftId}-${s.index}`}
              index={i}
              weight={s.weight}
              reps={s.reps}
              amrap={s.amrap}
              pct={s.pct}
              unit={session.unit}
              done={done}
              next={!done && i === nextIndex}
              onPress={() => onStartSet?.(i)}
            />
          );
        })}
      </View>

      <View style={{ paddingHorizontal: shape.rLg, gap: shape.rXs }} testID="today-bbb-section">
        <Caps>BBB · 5×10 @ 50%</Caps>
        <SetRow
          index={0}
          weight={bbbWeight}
          reps={10}
          amrap={false}
          pct={0.5}
          unit={session.unit}
        />
      </View>

      <View
        style={{ paddingHorizontal: shape.rLg, gap: shape.rXs }}
        testID="today-assistance-section"
      >
        <Caps>Assistance</Caps>
        {DEFAULT_ASSISTANCE.map((item) => (
          <AssistanceRow key={item.name} item={item} />
        ))}
      </View>
    </ScrollView>
  );
}

export default TodayData;
