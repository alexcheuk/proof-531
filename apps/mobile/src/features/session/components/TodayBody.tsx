import { Masthead } from '@/design/primitives/Masthead';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { dateLabel, liftDisplayName, weekLabel } from '@/domain/labels';
import { prescription } from '@/domain/schemes';
import type { Lift, Unit, Week } from '@/domain/types';
import { displayUnit, round } from '@/domain/units';
/**
 * Today screen body — masthead + title block + working-sets list.
 *
 * Pure presentation; the parent owns the data fetch + Start handler. Ported
 * from `~/Development/531-pwa/src/features/session/components/TodayBody.tsx`,
 * trimmed for the mobile MVP: we render the working-sets list (the spec's
 * "preview of the upcoming session"). Top-set hero block, BBB band, and the
 * colophon track the PWA closely enough that we surface them at modest
 * fidelity here — the colophon is in particular load-bearing to the Today
 * visual identity, so it stays.
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
};

export function TodayBody({
  lift,
  week,
  cycle,
  storageUnit,
  displayUnit: displayUnitProp,
  tm,
}: TodayBodyProps) {
  const { colors, type } = useTheme();
  const sets = prescription(week);
  // For the MVP we display weights in the storage unit (no cross-unit
  // conversion). The full PWA path runs storage→display via
  // `displayWeight()` which is not yet ported. When `displayUnitProp` is
  // omitted (the common case from useSettings) we fall back to storage.
  const renderUnit: Unit = displayUnitProp ?? storageUnit;

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
      <View style={sectionStyle}>
        <View style={sectionHeaderRow}>
          <RNText style={capsLabel}>WORKING SETS</RNText>
          <RNText style={capsHint}>
            TM {tm} {displayUnit(renderUnit)}
          </RNText>
        </View>
        <View>
          {sets.map((s, i) => {
            const w = round(tm * s.pct, storageUnit);
            // Working sets are a fixed-length (3) prescription per (lift, week);
            // the (pct, reps) pair is stable per index, so it forms a stable key.
            const key = `${s.pct}-${s.reps}-${s.amrap ? 'a' : 'w'}`;
            return (
              <SetRow
                key={key}
                index={(i + 1) as 1 | 2 | 3}
                isLast={i === sets.length - 1}
                weight={w}
                unit={renderUnit}
                reps={s.reps}
                amrap={!!s.amrap}
                pct={s.pct}
                testID={`set-row-${i}`}
              />
            );
          })}
        </View>
      </View>
      <RNText style={colophonStyle}>{'— END OF SESSION —'}</RNText>
    </View>
  );
}
