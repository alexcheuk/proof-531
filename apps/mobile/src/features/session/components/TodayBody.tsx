import { Masthead } from '@/design/primitives/Masthead';
import { SectionBand } from '@/design/primitives/SectionBand';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { dateLabel, liftDisplayName, weekLabel } from '@/domain/labels';
import { decompose } from '@/domain/plates';
import { WARMUPS, prescription } from '@/domain/schemes';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convertWeight, displayUnit, displayWeight, round } from '@/domain/units';
/**
 * Today screen body — masthead + title block + top-set hero + working-sets list
 * + BBB band + colophon.
 *
 * Pure presentation; the parent owns the data fetch + Start handler. Ported
 * from `~/Development/531-pwa/src/features/session/components/TodayBody.tsx`.
 *
 * Plate visualization lives only in the top-set hero (matching ref). Working
 * sets and BBB show numerics only.
 */
import { Pressable, Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { SetRow } from './SetRow';

/**
 * Shape of one warmup ramp row, derived from `WARMUPS` × the lift's TM.
 *
 * `negativeIndex` is the storage index used when logging this row
 * (`-1 - rampIndex`); kept negative so warmup rows sort above working sets
 * in any future sort-by-index query and do not collide with working-set
 * indices 0–2.
 */
export type WarmupRampRow = {
  rampIndex: 0 | 1 | 2;
  negativeIndex: -1 | -2 | -3;
  pct: number;
  prescribedWeight: number;
  prescribedReps: number;
};

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
   * 1-based index of the next-pending working set (1, 2, or 3). Renders an
   * `UP NEXT` chip on that row. Defaults to 1 — the first set is "next" when
   * no session progress is known.
   */
  nextSetIndex?: 1 | 2 | 3;
  /**
   * 0-based indices of working/AMRAP sets that have already been logged.
   * Each matching `SetRow` renders with the `done` checkmark + line-through.
   * Defaults to an empty list (preview mode — nothing done yet).
   */
  completedIndices?: ReadonlyArray<0 | 1 | 2>;
  /**
   * Stretch path for W1.2 — invoked when a warmup-ramp row is tapped. The
   * caller is expected to dispatch `appendSetLog(... kind: 'warmup' ...)`
   * with the row's `negativeIndex`. When `undefined`, the rows render as
   * plain reference text (MVP form).
   */
  onLogWarmup?: (row: WarmupRampRow) => void;
  /**
   * Set of `negativeIndex` values that have already been logged for this
   * session. Used to render the "checked" state on a warmup row.
   */
  loggedWarmupIndices?: ReadonlyArray<number>;
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
  onLogWarmup,
  loggedWarmupIndices,
}: TodayBodyProps) {
  const { colors, type } = useTheme();
  const sets = prescription(week);
  // Render unit defaults to storage when the caller doesn't pass a display
  // unit (e.g. legacy entry points).
  const renderUnit: Unit = displayUnitProp ?? storageUnit;
  const unitGlyph = displayUnit(renderUnit);
  const tmInDisplay = Math.round(convertWeight(tm, storageUnit, renderUnit));

  // Hero shows the NEXT SET to work on (advances as the user logs sets).
  // Falls back to set 1 in preview mode (when nothing is completed yet).
  // `prescription(week)` always returns a 3-tuple; we still narrow via a
  // runtime guard to satisfy strict-null types.
  const heroZeroBased = (nextSetIndex - 1) as 0 | 1 | 2;
  const heroSet = sets[heroZeroBased];

  if (!heroSet) {
    return null;
  }

  // Hero: snap storage, convert, decompose for the next-set weight.
  const heroWeightStorage = round(tm * heroSet.pct, storageUnit);
  const heroWeight = displayWeight(heroWeightStorage, storageUnit, renderUnit);
  const heroDecomposed = decompose(heroWeight, plateSet);

  // BBB: 5×10 @ 50% TM. Summary-only row (no plate viz, matching ref).
  const bbbWeightStorage = round(tm * 0.5, storageUnit);
  const bbbWeight = displayWeight(bbbWeightStorage, storageUnit, renderUnit);

  // Warmup ramp — canonical Wendler 5/3/1 warmup (40/50/60 % × 5/5/3).
  // Computed in storage units then converted to display. Per-side plate
  // decomposition is rendered as a single inline summary chip below the
  // row (full `PlateBar` would overpower the top-set hero).
  const loggedSet = new Set(loggedWarmupIndices ?? []);
  const warmupRows = WARMUPS.map((w, i) => {
    const rampIndex = i as 0 | 1 | 2;
    const negativeIndex = (-1 - rampIndex) as -1 | -2 | -3;
    const wStorage = round(tm * w.pct, storageUnit);
    const wDisplay = displayWeight(wStorage, storageUnit, renderUnit);
    const perSide = decompose(wDisplay, plateSet).perSide;
    const perSideLabel = perSide.length === 0 ? 'bar only' : `${perSide.join(' + ')} / side`;
    return {
      rampIndex,
      negativeIndex,
      pct: w.pct,
      prescribedWeight: wStorage,
      prescribedReps: w.reps,
      displayWeight: wDisplay,
      perSideLabel,
      logged: loggedSet.has(negativeIndex),
    };
  });

  const cycleBadgeStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  const sectionStyle: ViewStyle = {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 0,
  };

  const heroStyle: ViewStyle = {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  };

  const bbbSectionStyle: ViewStyle = {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
  };

  const sectionHeaderRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  };

  const capsLabel: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  const capsHint: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
  };

  const colophonStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 2.88,
    textTransform: 'uppercase',
    color: colors.ink3,
    textAlign: 'center',
    marginTop: 40,
  };

  const warmupSectionStyle: ViewStyle = {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  };
  const warmupSummaryChipStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink2,
    paddingLeft: 28,
    paddingBottom: 8,
  };

  // BBB summary row — caps + giant weight + caps unit.
  const bbbSummaryRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const bbbCountStyle: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 16,
    letterSpacing: -0.16,
    color: colors.ink1,
  };
  const bbbWeightWrapStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  };
  const bbbWeightStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 26,
    lineHeight: 26,
    letterSpacing: -0.78,
    color: colors.ink0,
    fontVariant: ['tabular-nums', 'lining-nums'],
  };
  const bbbWeightCapsStyle: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };

  return (
    <View style={{ backgroundColor: colors.bg0 }}>
      <Masthead rightSlot={<RNText style={cycleBadgeStyle}>{`c${cycle}·d${week}`}</RNText>} />
      <TitleBlock
        eyebrow={`${dateLabel(new Date())} · ${weekLabel(week)}`}
        title={`${liftDisplayName(lift)}.`}
        style={{ paddingTop: 20, paddingBottom: 24 }}
      />

      {/* W1.2 Warmup ramp — orthodox 5/3/1 warmup (40/50/60 × 5/5/3). Sits
          above the next-set hero so the user can ramp before staring at
          the prescription they're about to lift. */}
      <View style={warmupSectionStyle} testID="today-warmup-ramp">
        <View style={sectionHeaderRow}>
          <RNText style={capsLabel}>WARMUP</RNText>
          <RNText style={capsHint}>40 / 50 / 60</RNText>
        </View>
        <View>
          {warmupRows.map((row, i) => {
            const oneBased = (row.rampIndex + 1) as 1 | 2 | 3;
            const setRow = (
              <SetRow
                index={oneBased}
                isLast={i === warmupRows.length - 1}
                weight={row.displayWeight}
                unit={renderUnit}
                reps={row.prescribedReps}
                amrap={false}
                pct={row.pct}
                done={row.logged}
                prefix={`W${oneBased}`}
                testID={`warmup-row-${row.rampIndex}`}
              />
            );
            const summary = <RNText style={warmupSummaryChipStyle}>{row.perSideLabel}</RNText>;
            const inner = (
              <>
                {setRow}
                {summary}
              </>
            );
            if (onLogWarmup && !row.logged) {
              return (
                <Pressable
                  key={`warmup-${row.rampIndex}`}
                  testID={`warmup-row-${row.rampIndex}-pressable`}
                  accessibilityRole="button"
                  accessibilityLabel={`Warmup ${oneBased} of 3, ${row.displayWeight} ${displayUnit(renderUnit) === 'lb' ? 'pounds' : 'kilograms'}, ${row.prescribedReps} reps, ${Math.round(row.pct * 100)} percent`}
                  onPress={() => {
                    onLogWarmup({
                      rampIndex: row.rampIndex,
                      negativeIndex: row.negativeIndex,
                      pct: row.pct,
                      prescribedWeight: row.prescribedWeight,
                      prescribedReps: row.prescribedReps,
                    });
                  }}
                >
                  {inner}
                </Pressable>
              );
            }
            return <View key={`warmup-${row.rampIndex}`}>{inner}</View>;
          })}
        </View>
      </View>

      {/* Next-set hero — full PlateBar inside TopSetBlock. The eyebrow
          reads "NEXT SET" so users prepping plates know which prescription
          they're staring at (advances as completed sets accumulate). */}
      <View style={heroStyle}>
        <TopSetBlock
          eyebrow="NEXT SET"
          weight={heroWeight}
          unitGlyph={unitGlyph}
          reps={heroSet.reps}
          amrap={!!heroSet.amrap}
          pctLabel={`${Math.round(heroSet.pct * 100)}%`}
          tmLabel={`TM ${tmInDisplay} ${unitGlyph}`}
          perSide={heroDecomposed.perSide}
          plateVariant="full"
          bordered={false}
          testID="today-top-set"
        />
      </View>

      <View style={sectionStyle}>
        <View style={sectionHeaderRow}>
          <RNText style={capsLabel}>WORKING SETS</RNText>
          <RNText style={capsHint}>
            TM {tmInDisplay} {unitGlyph}
          </RNText>
        </View>
        <View>
          {sets.map((s, i) => {
            const wStorage = round(tm * s.pct, storageUnit);
            const w = displayWeight(wStorage, storageUnit, renderUnit);
            // Working sets are a fixed-length (3) prescription per (lift, week);
            // the (pct, reps) pair is stable per index, so it forms a stable key.
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

      {/* BBB band — 5 × 10 @ 50% TM, numeric summary only (matching ref). */}
      <View style={bbbSectionStyle}>
        <View style={sectionHeaderRow}>
          <RNText style={capsLabel}>BORING BUT BIG</RNText>
        </View>
        <SectionBand padding="tight" testID="today-bbb-band">
          <View style={bbbSummaryRow}>
            <RNText style={bbbCountStyle}>5 sets of 10</RNText>
            <View style={bbbWeightWrapStyle}>
              <RNText style={bbbWeightStyle}>{bbbWeight}</RNText>
              <RNText style={bbbWeightCapsStyle}>{unitGlyph} · 50%</RNText>
            </View>
          </View>
        </SectionBand>
      </View>

      <RNText style={colophonStyle}>{'— END OF SESSION —'}</RNText>
    </View>
  );
}
