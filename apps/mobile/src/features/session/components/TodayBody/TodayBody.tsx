import { useClearMissState } from '@/data/queries/useClearMissState';
import { useLastCompletedSessionForLift } from '@/data/queries/useLastCompletedSessionForLift';
import { useMissState } from '@/data/queries/useMissState';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Masthead } from '@/design/primitives/Masthead';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { dateLabel, dayIntent, daySchemeLabel, liftDisplayName } from '@/domain/labels';
import { formatRelativeTime } from '@/domain/relativeTime';
import { prescription, tmTestSet } from '@/domain/schemes';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convert, displayUnit } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { View } from 'react-native';
import { MissCorrectionCard } from '../MissCorrectionCard';
import { MissResetSheet } from '../MissResetSheet';
import { BbbBand } from './BbbBand';
import { TmTestNote } from './TmTestNote';
import { TopSetHero } from './TopSetHero';
import { WarmupsBand } from './WarmupsBand';
import { WorkingSetsBand } from './WorkingSetsBand';

export type TodayBodyProps = {
  lift: Lift;
  week: Week;
  cycle: number;
  /** Storage unit of the TM — drives the snap math. */
  storageUnit: Unit;
  displayUnit?: Unit;
  tm: number;
  /** Configured plate set — drives plate decomposition (bar + plate inventory). */
  plateSet: PlateSet;
  // 1-based; defaults to 1 (first set is "next" when no progress is known)
  nextSetIndex?: 1 | 2 | 3;
  // 0-based; defaults to [] (preview mode — nothing done yet)
  completedIndices?: ReadonlyArray<0 | 1 | 2>;
  // BBB-specific rest target — NOT the working-set rest target
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
  const renderUnit: Unit = displayUnitProp ?? storageUnit;
  const unitGlyph = displayUnit(renderUnit);
  const tmInDisplay = convert(tm, storageUnit, renderUnit);
  const lastTrained = useLastCompletedSessionForLift(lift);

  // Missed-rep Program Correction re-surface. An unresolved miss (missCount > 0,
  // reset not yet applied) shows the card at the very top of the body. While
  // loading or on error the data is undefined → missCount 0 → no card, so the
  // preview never shifts. No entrance animation here (the card is present on
  // mount, not a just-happened event).
  const missState = useMissState(lift);
  const clearMiss = useClearMissState();
  const [missResetOpen, setMissResetOpen] = useState(false);
  const missCount = missState.data?.missCount ?? 0;

  const isTmTestDay = week === 4;
  // Day 4 is a single TM-test set; route via the dedicated helper so the
  // index-based API on days 1–3 stays unchanged.
  const heroSet = isTmTestDay
    ? tmTestSet()
    : (() => {
        const sets = prescription(week);
        const heroZeroBased = (nextSetIndex - 1) as 0 | 1 | 2;
        return sets[heroZeroBased] ?? null;
      })();
  if (!heroSet) return null;

  return (
    <View style={{ backgroundColor: colors.bg0 }}>
      {missCount > 0 ? (
        <>
          <MissCorrectionCard
            variant={missCount >= 2 ? 'forced' : 'choice'}
            tmDisplay={tmInDisplay}
            unit={renderUnit}
            onReset={() => {
              void Haptics.selectionAsync();
              setMissResetOpen(true);
            }}
            {...(missCount >= 2
              ? {}
              : {
                  onOffDay: () => {
                    void Haptics.selectionAsync();
                    clearMiss.mutate({ lift });
                  },
                })}
          />
          <MissResetSheet
            open={missResetOpen}
            lift={lift}
            tmDisplay={tmInDisplay}
            unit={renderUnit}
            onClose={() => setMissResetOpen(false)}
          />
        </>
      ) : null}
      <Masthead rightSlot={<CapsLabel>{`c${cycle}·d${week}`}</CapsLabel>} />
      <TitleBlock
        eyebrow={`${dateLabel(new Date())} · ${daySchemeLabel(week)}`}
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
        <CapsLabel size="xs" color="ink2" testID="today-day-intent">
          {dayIntent(week)}
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
        {...(isTmTestDay
          ? { eyebrow: 'TM TEST', pctLabel: '100% TM', repsRange: [3, 5] as const }
          : {})}
      />

      <WarmupsBand
        tm={tm}
        storageUnit={storageUnit}
        renderUnit={renderUnit}
        unitGlyph={unitGlyph}
        week={week}
      />

      {isTmTestDay ? (
        // Week 4: TM test set IS the work. No 3-set scheme, no BBB. The
        // guidance card replaces the BBB band's visual weight.
        <TmTestNote />
      ) : (
        <>
          <WorkingSetsBand
            sets={prescription(week)}
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
        </>
      )}

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
