import { Icon } from '@/design/icons';
import { Caps } from '@/design/primitives/Caps';
import { Eyebrow } from '@/design/primitives/Eyebrow';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape, type } from '@/design/tokens';
import { TodayHeader } from '@/features/today/TodayHeader';
import { type TodaySession, WEEK_LABEL } from '@/features/today/today-types';
import type React from 'react';
import { ScrollView, View } from 'react-native';
import { LiftPickerCard } from './LiftPickerCard';

export type HomeLift = {
  id: string;
  label: string;
  trainingMax: number;
  topWeight: number;
  topReps: number;
  amrap: boolean;
  pct: number;
  lastDaysAgo?: number;
  lastTopReps?: number;
};

export type HomeCycleStatus =
  | { kind: 'freshStart' }
  | { kind: 'active'; cycle: number; week: 1 | 2 | 3 | 4 }
  | { kind: 'justAdvanced'; fromCycle: number; toCycle: number };

export type HomeRecentNotice = {
  title: string;
  subline: string;
};

export type HomeScreenProps = {
  greeting: string;
  /** Hero title — currently fixed in design as "Pick a lift." / "Press start." */
  headline?: string;
  cycleStatus: HomeCycleStatus;
  lifts: HomeLift[];
  unit: 'lbs' | 'kg';
  completedSessions: number;
  /** Optional ember-tone "recent" notice card. Only renders when set. */
  recentNotice?: HomeRecentNotice;
  onLiftPress?: (liftId: string) => void;
  onOpenWatch?: () => void;
};

const LIFT_ORDER: readonly string[] = ['squat', 'bench', 'deadlift', 'press'];
const LIFT_SHORT: Record<string, string> = {
  squat: 'SQU',
  bench: 'BEN',
  deadlift: 'DEA',
  press: 'PRE',
};

function deriveCycleWeek(status: HomeCycleStatus): { cycle: number; week: 1 | 2 | 3 | 4 } {
  if (status.kind === 'active') return { cycle: status.cycle, week: status.week };
  if (status.kind === 'justAdvanced') return { cycle: status.toCycle, week: 1 };
  return { cycle: 1, week: 1 };
}

/**
 * Home (lift-picker) screen.
 *
 * Behavioral source: `design-reference/screens-meta.jsx` `HomeScreen`
 * (lines 6-178). Sections (top→bottom):
 *   1. Brand bar (reuses TodayHeader)
 *   2. Greeting + hero title ("Pick a lift. / Press start.")
 *   3. Compound cycle pill (C# · W#  +  scheme caption)
 *   4. "Your lifts · tap to start" + 1- or 2-column LiftPickerCard grid
 *   5. Quick stats — two bright cards (this-cycle progress + active-lifts chips)
 *   6. Optional ember "Recent" notice card
 */
export function HomeScreen({
  greeting,
  cycleStatus,
  lifts,
  unit,
  completedSessions,
  recentNotice,
  onLiftPress,
  onOpenWatch,
}: HomeScreenProps) {
  const { cycle, week } = deriveCycleWeek(cycleStatus);
  const singleLift = lifts.length === 1;
  const totalSessions = lifts.length * 4;
  const pct = totalSessions === 0 ? 0 : Math.min(100, (completedSessions / totalSessions) * 100);

  // Build a minimal TodaySession to satisfy TodayHeader. The header only reads
  // `cycleNumber` and `weekOfCycle` in practice; populate the rest with
  // defaults that won't break the type contract.
  const headerSession: TodaySession = {
    cycleNumber: cycle,
    liftId: lifts[0]?.id ?? 'squat',
    liftLabel: lifts[0]?.label ?? 'Squat',
    trainingMax: lifts[0]?.trainingMax ?? 0,
    unit,
    weekOfCycle: week,
    sets: [],
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ paddingBottom: shape.rLg * 4 }}
      testID="home-screen"
    >
      {/* Section 1 — brand bar */}
      <TodayHeader session={headerSession} onOpenWatch={onOpenWatch ?? (() => {})} />

      {/* Section 2 — greeting + hero */}
      <View style={{ paddingHorizontal: shape.rLg, paddingTop: shape.rMd }}>
        <Eyebrow>{greeting}</Eyebrow>
        <Text variant="display" style={{ marginTop: shape.rXs }}>
          Pick a lift.
          {'\n'}
          <Text variant="display" tone="hot">
            Press start.
          </Text>
        </Text>

        {/* Section 3 — compound cycle pill */}
        <CycleStatusPill cycle={cycle} week={week} status={cycleStatus} />
      </View>

      {/* Section 4 — lift picker grid */}
      <View style={{ paddingHorizontal: shape.rLg, paddingTop: shape.rLg }}>
        <Caps style={{ marginBottom: shape.rSm + shape.rXs / 2 }}>your lifts · tap to start</Caps>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: shape.rSm + shape.rXs / 2,
          }}
          testID="lift-picker-grid"
        >
          {lifts.map((lift) => (
            <View
              key={lift.id}
              style={{
                width: singleLift ? '100%' : `${(100 - shape.rXs / 2) / 2}%`,
                flexGrow: singleLift ? 1 : 0,
              }}
            >
              <LiftPickerCard
                liftId={lift.id}
                liftLabel={lift.label}
                trainingMax={lift.trainingMax}
                topWeight={lift.topWeight}
                topReps={lift.topReps}
                amrap={lift.amrap}
                pct={lift.pct}
                unit={unit}
                large={singleLift}
                lastDaysAgo={lift.lastDaysAgo}
                lastTopReps={lift.lastTopReps}
                onPress={() => onLiftPress?.(lift.id)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Section 5 — quick stats */}
      <View style={{ paddingHorizontal: shape.rLg, paddingTop: shape.rLg }}>
        <View style={{ flexDirection: 'row', gap: shape.rSm + shape.rXs / 2 }}>
          <View style={{ flex: 1 }}>
            <StatCard testID="stats-card-cycle">
              <Caps>This cycle</Caps>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: shape.rXs,
                  marginTop: shape.rXs + shape.hairline,
                }}
              >
                <WeightNum value={completedSessions} size="md" />
                <Caps style={{ color: colors.ink2 }}>{`/ ${totalSessions}`}</Caps>
              </View>
              <View
                style={{
                  height: shape.hairline * 3,
                  backgroundColor: colors.line,
                  borderRadius: shape.rPill,
                  marginTop: shape.rSm,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    backgroundColor: colors.hot,
                  }}
                />
              </View>
            </StatCard>
          </View>
          <View style={{ flex: 1 }}>
            <StatCard testID="stats-card-active-lifts">
              <Caps>Active lifts</Caps>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  gap: shape.rXs,
                  marginTop: shape.rXs + shape.hairline,
                }}
              >
                <WeightNum value={lifts.length} size="md" />
                <Caps style={{ color: colors.ink2 }}>{'/ 4'}</Caps>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  gap: shape.rXs,
                  marginTop: shape.rSm,
                  flexWrap: 'wrap',
                }}
              >
                {LIFT_ORDER.map((l) => {
                  const enabled = lifts.some((x) => x.id === l);
                  return (
                    <View
                      key={l}
                      style={{
                        paddingHorizontal: shape.rXs + shape.hairline,
                        paddingVertical: shape.hairline * 2,
                        borderRadius: shape.rXs,
                        backgroundColor: enabled ? colors.bg3 : 'transparent',
                        borderWidth: enabled ? 0 : shape.hairline,
                        borderColor: colors.line,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: type.mono,
                          fontSize: shape.rSm + shape.hairline,
                          fontWeight: '600',
                          letterSpacing: 0.8,
                          textTransform: 'uppercase',
                          color: enabled ? colors.ink0 : colors.ink3,
                        }}
                      >
                        {LIFT_SHORT[l] ?? l.slice(0, 3).toUpperCase()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </StatCard>
          </View>
        </View>
      </View>

      {/* Section 6 — recent ember notice */}
      {recentNotice ? (
        <View style={{ paddingHorizontal: shape.rLg, paddingTop: shape.rMd }}>
          <View
            testID="home-recent-notice"
            style={{
              backgroundColor: colors.hot,
              borderRadius: shape.rMd,
              padding: shape.rMd + shape.rXs,
              flexDirection: 'row',
              alignItems: 'center',
              gap: shape.rMd,
            }}
          >
            <View
              style={{
                width: shape.iconButton,
                height: shape.iconButton,
                borderRadius: shape.rPill,
                backgroundColor: colors.lineStrong,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Reference uses `sparkle`; our registry doesn't ship it, so
                  substitute the closest "celebration" glyph. */}
              <Icon
                name="lightning"
                size={shape.rMd + shape.rXs}
                color={colors.ink0}
                stroke={1.6}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: shape.rMd + shape.hairline,
                  fontWeight: '500',
                  color: colors.ink0,
                }}
              >
                {recentNotice.title}
              </Text>
              <Text
                style={{
                  fontFamily: type.mono,
                  fontSize: shape.rMd,
                  color: colors.ink1,
                  marginTop: shape.hairline * 2,
                  letterSpacing: 0.3,
                }}
              >
                {recentNotice.subline}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function CycleStatusPill({
  cycle,
  week,
  status,
}: {
  cycle: number;
  week: 1 | 2 | 3 | 4;
  status: HomeCycleStatus;
}) {
  const captionText =
    status.kind === 'freshStart'
      ? 'fresh start · pick week 1'
      : `week ${week} scheme · ${WEEK_LABEL[week]}`;
  return (
    <View
      testID="cycle-status-pill"
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: shape.rSm + shape.rXs / 2,
        marginTop: shape.rMd + shape.rXs / 2,
        paddingLeft: shape.rSm,
        paddingRight: shape.rMd,
        paddingVertical: shape.rXs + shape.hairline / 2,
        backgroundColor: colors.bg1,
        borderWidth: shape.hairline,
        borderColor: colors.line,
        borderRadius: shape.rPill,
      }}
    >
      <View
        style={{
          paddingHorizontal: shape.rSm,
          paddingVertical: shape.hairline * 3,
          backgroundColor: colors.hot,
          borderRadius: shape.rPill,
        }}
      >
        <Caps style={{ color: colors.ink0, letterSpacing: 1.8 }}>{`C${cycle} · W${week}`}</Caps>
      </View>
      <Caps style={{ color: colors.ink1, letterSpacing: 0.8 }}>{captionText}</Caps>
    </View>
  );
}

function StatCard({
  children,
  testID,
}: {
  children: React.ReactNode;
  testID?: string;
}) {
  return (
    <View
      testID={testID}
      style={{
        backgroundColor: colors.bg1,
        borderColor: colors.line,
        borderWidth: shape.hairline,
        borderRadius: shape.rMd,
        padding: shape.rMd + shape.rXs,
      }}
    >
      {children}
    </View>
  );
}

export default HomeScreen;
