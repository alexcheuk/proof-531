import { useLastCompletedSessionForLift } from '@/data/queries/useLastCompletedSessionForLift';
/**
 * Today screen body — masthead + title block + top-set hero + working-sets band
 * + BBB band + colophon. Composition shell over four sub-components.
 *
 * Pure presentation; the parent owns the data fetch + Start handler. Ported
 * from `~/Development/531-pwa/src/features/session/components/TodayBody.tsx`.
 *
 * Plate visualization lives only in the top-set hero (matching the PWA).
 * Working sets and BBB show numerics only.
 */
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { dateLabel, liftDisplayName, weekIntent, weekLabel } from '@/domain/labels';
import { formatRelativeTime } from '@/domain/relativeTime';
import { prescription } from '@/domain/schemes';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convertWeight, displayUnit } from '@/domain/units';
import { View } from 'react-native';
import { BbbBand } from './BbbBand';
import { TopSetHero } from './TopSetHero';
import { WarmupsBand } from './WarmupsBand';
import { WorkingSetsBand } from './WorkingSetsBand';

export type TodayBodyProps = {
  lift: Lift;
  week: Week;
  cycle: number;
  /** Storage unit of the TM — drives the snap math. */
  storageUnit: Unit;
  /** Display unit — drives the render conversion. */
  displayUnit?: Unit;
  /** Training Max value (in storage unit). */
  tm: number;
  /** Configured plate set — drives plate decomposition (bar + plate inventory). */
  plateSet: PlateSet;
  /**
   * 1-based index of the next-pending working set (1, 2, or 3). Defaults
   * to 1 — the first set is "next" when no progress is known.
   */
  nextSetIndex?: 1 | 2 | 3;
  /**
   * 0-based indices of working/AMRAP sets that have already been logged.
   * Defaults to an empty list (preview mode — nothing done yet).
   */
  completedIndices?: ReadonlyArray<0 | 1 | 2>;
  /**
   * User's configured BBB rest target (seconds). When provided, shown as
   * a hint chip next to the BBB band so the user can verify their pace
   * before starting. Sourced from `settings.bbbRestTargetSeconds` — NOT
   * the working-set rest target.
   */
  bbbRestTargetSeconds?: number;
};

export function TodayBody({
  lift,
  week,
  cycle,
  storageUnit,
  displayUnit: displayUnitProp,
  tm,
  plateSet,
  nextSetIndex = 1,
  completedIndices = [],
  bbbRestTargetSeconds,
}: TodayBodyProps) {
  const { colors, layout, spacing } = useTheme();
  const sets = prescription(week);
  const renderUnit: Unit = displayUnitProp ?? storageUnit;
  const unitGlyph = displayUnit(renderUnit);
  const tmInDisplay = Math.round(convertWeight(tm, storageUnit, renderUnit));
  const lastTrained = useLastCompletedSessionForLift(lift);

  // Hero shows the NEXT SET to work on. `prescription(week)` always returns a
  // 3-tuple; we still narrow via a runtime guard to satisfy strict-null types.
  const heroZeroBased = (nextSetIndex - 1) as 0 | 1 | 2;
  const heroSet = sets[heroZeroBased];
  if (!heroSet) return null;

  return (
    <View style={{ backgroundColor: colors.bg0 }}>
      <Masthead rightSlot={<CapsLabel>{`c${cycle}·d${week}`}</CapsLabel>} />
      <TitleBlock
        eyebrow={`${dateLabel(new Date())} · ${weekLabel(week)}`}
        title={`${liftDisplayName(lift)}.`}
        style={{ paddingTop: 20, paddingBottom: 20 }}
      />
      <View
        style={{
          paddingHorizontal: layout.gutter,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
          gap: spacing.xs,
        }}
      >
        <CapsLabel size="xs" color="ink2" testID="today-week-intent">
          {weekIntent(week)}
        </CapsLabel>
        {lastTrained.startedAt ? (
          <CapsLabel size="xs" color="ink3" testID="today-last-trained">
            {`Last ${liftDisplayName(lift).toLowerCase()} day · ${formatRelativeTime(lastTrained.startedAt)}`}
          </CapsLabel>
        ) : null}
      </View>

      <TopSetHero
        set={heroSet}
        tm={tm}
        storageUnit={storageUnit}
        renderUnit={renderUnit}
        unitGlyph={unitGlyph}
        tmInDisplay={tmInDisplay}
        plateSet={plateSet}
      />

      <WarmupsBand
        tm={tm}
        storageUnit={storageUnit}
        renderUnit={renderUnit}
        unitGlyph={unitGlyph}
      />

      <WorkingSetsBand
        sets={sets}
        tm={tm}
        storageUnit={storageUnit}
        renderUnit={renderUnit}
        unitGlyph={unitGlyph}
        tmInDisplay={tmInDisplay}
        nextSetIndex={nextSetIndex}
        completedIndices={completedIndices}
      />

      <BbbBand
        tm={tm}
        storageUnit={storageUnit}
        renderUnit={renderUnit}
        unitGlyph={unitGlyph}
        {...(bbbRestTargetSeconds !== undefined ? { bbbRestTargetSeconds } : {})}
      />

      <CapsLabel
        size="xs"
        color="ink3"
        style={{ textAlign: 'center', marginTop: spacing.xxxl, letterSpacing: 2.88 }}
      >
        — END OF SESSION —
      </CapsLabel>
    </View>
  );
}
