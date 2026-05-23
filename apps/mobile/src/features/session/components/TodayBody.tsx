import { Masthead } from '@/design/primitives/Masthead';
import { PlateBar } from '@/design/primitives/PlateBar';
import { SectionBand } from '@/design/primitives/SectionBand';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { TopSetBlock } from '@/design/primitives/TopSetBlock';
import { useTheme } from '@/design/theme';
import { dateLabel, liftDisplayName, weekLabel } from '@/domain/labels';
import { decompose } from '@/domain/plates';
import { bbbSets, prescription } from '@/domain/schemes';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convertWeight, displayUnit, displayWeight, round } from '@/domain/units';
/**
 * Today screen body — masthead + title block + top-set hero + working-sets list
 * + BBB band + colophon.
 *
 * Pure presentation; the parent owns the data fetch + Start handler. Ported
 * from `~/Development/531-pwa/src/features/session/components/TodayBody.tsx`.
 *
 * Plate decompositions are computed inline against the display weight under
 * the configured `plateSet`. Each working-set row is followed by a mini
 * `PlateBar` so the lifter can see the load-out at a glance.
 */
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { SetRow } from './SetRow';

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
};

export function TodayBody({
  lift,
  week,
  cycle,
  storageUnit,
  displayUnit: displayUnitProp,
  tm,
  plateSet,
}: TodayBodyProps) {
  const { colors, type } = useTheme();
  const sets = prescription(week);
  // `prescription(week)` returns a fresh 3-tuple per call — index 2 is
  // always defined. We still narrow via a runtime guard to keep the
  // strict-null types happy without a non-null assertion.
  const topSet = sets[2];
  // Render unit defaults to storage when the caller doesn't pass a display
  // unit (e.g. legacy entry points).
  const renderUnit: Unit = displayUnitProp ?? storageUnit;
  const unitGlyph = displayUnit(renderUnit);
  const tmInDisplay = Math.round(convertWeight(tm, storageUnit, renderUnit));

  if (!topSet) {
    return null;
  }

  // Top-set hero: snap storage, convert, decompose.
  const topWeightStorage = round(tm * topSet.pct, storageUnit);
  const topWeight = displayWeight(topWeightStorage, storageUnit, renderUnit);
  const topDecomposed = decompose(topWeight, plateSet);

  // BBB: 5×10 @ 50% TM. We render a single summary row + a mini PlateBar.
  const bbbWeightStorage = round(tm * 0.5, storageUnit);
  const bbbWeight = displayWeight(bbbWeightStorage, storageUnit, renderUnit);
  const bbbDecomposed = decompose(bbbWeight, plateSet);
  const bbbCount = bbbSets(0.5).length;

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

  const setPlateRowStyle: ViewStyle = {
    paddingTop: 6,
    paddingBottom: 14,
    paddingLeft: 34, // align under the weight cluster (past the index gutter)
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
  const bbbPlateRowStyle: ViewStyle = {
    paddingTop: 12,
  };

  return (
    <View style={{ backgroundColor: colors.bg0 }}>
      <Masthead
        underline="hairline"
        rightSlot={<RNText style={cycleBadgeStyle}>{`c${cycle}·d${week}`}</RNText>}
      />
      <TitleBlock
        eyebrow={`${dateLabel(new Date())} · ${weekLabel(week)}`}
        title={`${liftDisplayName(lift)}.`}
        style={{ paddingTop: 20, paddingBottom: 24 }}
      />

      {/* Top set hero — full PlateBar inside TopSetBlock. */}
      <View style={heroStyle}>
        <TopSetBlock
          weight={topWeight}
          unitGlyph={unitGlyph}
          reps={topSet.reps}
          amrap={!!topSet.amrap}
          pctLabel={`${Math.round(topSet.pct * 100)}%`}
          tmLabel={`TM ${tmInDisplay} ${unitGlyph}`}
          perSide={topDecomposed.perSide}
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
            const decomposed = decompose(w, plateSet);
            // Working sets are a fixed-length (3) prescription per (lift, week);
            // the (pct, reps) pair is stable per index, so it forms a stable key.
            const key = `${s.pct}-${s.reps}-${s.amrap ? 'a' : 'w'}`;
            return (
              <View key={key}>
                <SetRow
                  index={(i + 1) as 1 | 2 | 3}
                  isLast={false}
                  weight={w}
                  unit={renderUnit}
                  reps={s.reps}
                  amrap={!!s.amrap}
                  pct={s.pct}
                  testID={`set-row-${i}`}
                />
                <View style={setPlateRowStyle} testID={`set-row-${i}-plate-row`}>
                  <PlateBar
                    perSide={decomposed.perSide}
                    unitGlyph={unitGlyph}
                    weight={w}
                    mini
                    testID={`set-row-${i}-plate-bar`}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* BBB band — 5 × 10 @ 50% TM, summary + mini plate viz. */}
      <View style={bbbSectionStyle}>
        <View style={sectionHeaderRow}>
          <RNText style={capsLabel}>BBB · {bbbCount} × 10 @ 50% TM</RNText>
          <RNText style={capsHint}>BORING BUT BIG</RNText>
        </View>
        <SectionBand padding="tight" testID="today-bbb-band">
          <View style={bbbSummaryRow}>
            <RNText style={bbbCountStyle}>5 sets of 10</RNText>
            <View style={bbbWeightWrapStyle}>
              <RNText style={bbbWeightStyle}>{bbbWeight}</RNText>
              <RNText style={bbbWeightCapsStyle}>{unitGlyph} · 50%</RNText>
            </View>
          </View>
          <View style={bbbPlateRowStyle}>
            <PlateBar
              perSide={bbbDecomposed.perSide}
              unitGlyph={unitGlyph}
              weight={bbbWeight}
              mini
              testID="today-bbb-plate-bar"
            />
          </View>
        </SectionBand>
      </View>

      <RNText style={colophonStyle}>{'— END OF SESSION —'}</RNText>
    </View>
  );
}
