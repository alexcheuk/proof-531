import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { WorkingSet } from '@/domain/schemes';
import type { Unit } from '@/domain/types';
import { displayWeight, round } from '@/domain/units';
// SetRow stays in features/session/ (it is also consumed by WarmupsBand and
// ReceiptRow there). The shared band references it by alias rather than
// duplicating it — per the design spec's "New primitives §2" boundary note.
import { SetRow } from '@/features/session/components/SetRow';
import { View } from 'react-native';
import { LadderRow } from './LadderRow';

export type WorkingSetsBandProps = {
  sets: ReadonlyArray<WorkingSet>;
  tm: number;
  storageUnit: Unit;
  renderUnit: Unit;
  unitGlyph: 'lb' | 'kg';
  tmInDisplay: number;
  /** 'full' = interactive session ladder (default, today's behavior).
   *  'compact' = read-only glance ladder for Home: hairline rows, mono,
   *  no plate viz, no UP NEXT / AMRAP badges, no done-dimming, top set inked. */
  variant?: 'full' | 'compact';
  // The two fields below are only meaningful for variant='full'. In 'compact'
  // there is no "next" set and no completion state, so they are ignored.
  nextSetIndex?: 1 | 2 | 3;
  completedIndices?: ReadonlyArray<0 | 1 | 2>;
  /** testID prefix for compact ladder rows (defaults to 'set-row'). */
  rowTestIDPrefix?: string;
};

/**
 * "WORKING SETS" band beneath the hero.
 *
 * - `variant="full"` (Today / Live): one interactive-looking `SetRow` per
 *   scheme entry with the `done` checkmark and `UP NEXT` chip applied.
 * - `variant="compact"` (Home): read-only hairline `LadderRow`s, mono numerals,
 *   no plate viz/badges/done-dimming. The AMRAP / top-set (or week-4 TM-test)
 *   row is ink-emphasised; the others are muted.
 */
export function WorkingSetsBand({
  sets,
  tm,
  storageUnit,
  renderUnit,
  unitGlyph,
  tmInDisplay,
  variant = 'full',
  nextSetIndex = 1,
  completedIndices = [],
  rowTestIDPrefix,
}: WorkingSetsBandProps) {
  const { layout, spacing } = useTheme();

  if (variant === 'compact') {
    const prefix = rowTestIDPrefix ?? 'home-ladder-row';
    return (
      <View>
        <Row justify="space-between" style={{ marginBottom: spacing.sm }}>
          <CapsLabel>WORKING SETS</CapsLabel>
          <CapsLabel size="xs" color="ink3">
            {`TM ${tmInDisplay} ${unitGlyph}`}
          </CapsLabel>
        </Row>
        <View>
          {sets.map((s, i) => {
            const wStorage = round(tm * s.pct, storageUnit);
            const w = displayWeight(wStorage, storageUnit, renderUnit);
            const key = `${s.pct}-${s.reps}-${s.amrap ? 'a' : 'w'}`;
            // The emphasised row is the AMRAP top set (weeks 1–3) or the
            // single TM-test row (week 4, kind 'tm-test').
            const emphasised = !!s.amrap || s.kind === 'tm-test';
            const isTmTest = s.kind === 'tm-test';
            return (
              <LadderRow
                key={key}
                index={i + 1}
                weight={w}
                unitGlyph={unitGlyph}
                reps={s.reps}
                {...(isTmTest ? { repsRange: [3, 5] as const } : {})}
                amrap={!!s.amrap}
                pct={s.pct}
                emphasised={emphasised}
                isFirst={i === 0}
                isLast={i === sets.length - 1}
                testID={`${prefix}-${i}`}
              />
            );
          })}
        </View>
      </View>
    );
  }

  const doneCount = completedIndices.length;
  return (
    <View style={{ paddingHorizontal: layout.gutter, paddingTop: spacing.lg + 4 }}>
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
