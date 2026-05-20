import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { ScrollView, View } from 'react-native';

export type HomeLift = {
  id: string;
  label: string;
  trainingMax: number;
};

export type HomeCycleStatus =
  | { kind: 'freshStart' }
  | { kind: 'active'; cycle: number; week: number }
  | { kind: 'justAdvanced'; fromCycle: number; toCycle: number };

export type HomeStats = {
  prs: number;
  sessions: number;
  daysLifted: number;
};

export type HomeScreenProps = {
  greeting: string;
  headline: string;
  cycleStatus: HomeCycleStatus;
  lifts: HomeLift[];
  stats: HomeStats;
  onLiftPress?: (liftId: string) => void;
};

export function HomeScreen({
  greeting,
  headline,
  cycleStatus,
  lifts,
  stats,
  onLiftPress,
}: HomeScreenProps) {
  const singleLift = lifts.length === 1;
  const firstLift = lifts[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ padding: shape.rLg, gap: shape.rLg }}
      testID="home-screen"
    >
      <View style={{ gap: shape.rXs }}>
        <Caps>{greeting}</Caps>
        <Text variant="title">{headline}</Text>
      </View>

      <CycleStatusPill status={cycleStatus} />

      {cycleStatus.kind === 'justAdvanced' ? (
        <Card padded testID="last-cycle-notice">
          <Caps>Last cycle</Caps>
          <Text>
            Cycle {cycleStatus.fromCycle} complete · advanced to {cycleStatus.toCycle}
          </Text>
        </Card>
      ) : null}

      {singleLift && firstLift ? (
        <Card padded interactive onPress={() => onLiftPress?.(firstLift.id)} testID="lift-single">
          <Caps>{firstLift.label}</Caps>
          <WeightNum value={firstLift.trainingMax} size="lg" />
        </Card>
      ) : (
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: shape.rSm }}
          testID="lift-picker-grid"
        >
          {lifts.map((lift) => (
            <View key={lift.id} style={{ width: '48%' }}>
              <Card padded interactive onPress={() => onLiftPress?.(lift.id)}>
                <Caps>{lift.label}</Caps>
                <WeightNum value={lift.trainingMax} size="md" />
              </Card>
            </View>
          ))}
        </View>
      )}

      <StatsRow stats={stats} />
    </ScrollView>
  );
}

function CycleStatusPill({ status }: { status: HomeCycleStatus }) {
  const label =
    status.kind === 'freshStart'
      ? 'Fresh start'
      : status.kind === 'active'
        ? `Cycle ${status.cycle} · Week ${status.week}`
        : `Cycle ${status.toCycle} just started`;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: colors.bg2,
        paddingVertical: shape.rXs,
        paddingHorizontal: shape.rMd,
        borderRadius: shape.rPill,
      }}
      testID="cycle-status-pill"
    >
      <Caps>{label}</Caps>
    </View>
  );
}

function StatsRow({ stats }: { stats: HomeStats }) {
  return (
    <View style={{ flexDirection: 'row', gap: shape.rLg }} testID="stats-row">
      <Stat label="PRs" value={stats.prs} />
      <Stat label="Sessions" value={stats.sessions} />
      <Stat label="Days" value={stats.daysLifted} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ gap: shape.rXs }}>
      <Caps>{label}</Caps>
      <WeightNum value={value} size="md" />
    </View>
  );
}
