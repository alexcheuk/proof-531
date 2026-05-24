import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { WorkingSet } from '@/domain/schemes';
import type { Unit } from '@/domain/types';
import { displayWeight, round } from '@/domain/units';
import { View } from 'react-native';
import { SetRow } from '../SetRow';

export type WorkingSetsBandProps = {
  sets: ReadonlyArray<WorkingSet>;
  tm: number;
  storageUnit: Unit;
  renderUnit: Unit;
  unitGlyph: 'lb' | 'kg';
  tmInDisplay: number;
  nextSetIndex: 1 | 2 | 3;
  completedIndices: ReadonlyArray<0 | 1 | 2>;
};

/**
 * "WORKING SETS · N of 3 done" band beneath the hero. Renders one SetRow
 * per scheme entry with the `done` checkmark and `UP NEXT` chip applied.
 */
export function WorkingSetsBand({
  sets,
  tm,
  storageUnit,
  renderUnit,
  unitGlyph,
  tmInDisplay,
  nextSetIndex,
  completedIndices,
}: WorkingSetsBandProps) {
  const { layout } = useTheme();
  const doneCount = completedIndices.length;
  return (
    <View style={{ paddingHorizontal: layout.gutter, paddingTop: 20 }}>
      <Row justify="space-between" style={{ marginBottom: 6 }}>
        <CapsLabel>
          {doneCount > 0 ? `WORKING SETS  ·  ${doneCount} OF ${sets.length} DONE` : 'WORKING SETS'}
        </CapsLabel>
        <CapsLabel size="xs" color="ink3">
          {`TM ${tmInDisplay} ${unitGlyph}`}
        </CapsLabel>
      </Row>
      <View>
        {sets.map((s, i) => {
          const wStorage = round(tm * s.pct, storageUnit);
          const w = displayWeight(wStorage, storageUnit, renderUnit);
          // Working sets are a fixed-length (3) prescription per (lift, week);
          // (pct, reps) is stable per index, so it forms a stable key.
          const key = `${s.pct}-${s.reps}-${s.amrap ? 'a' : 'w'}`;
          const oneBased = (i + 1) as 1 | 2 | 3;
          const zeroBased = i as 0 | 1 | 2;
          const isDone = completedIndices.includes(zeroBased);
          return (
            <SetRow
              key={key}
              index={oneBased}
              isLast={i === sets.length - 1}
              weight={w}
              unit={renderUnit}
              reps={s.reps}
              amrap={!!s.amrap}
              pct={s.pct}
              done={isDone}
              next={!isDone && oneBased === nextSetIndex}
              testID={`set-row-${i}`}
            />
          );
        })}
      </View>
    </View>
  );
}
