import { Barbell } from '@/design/plates/Barbell';
import { Chips } from '@/design/plates/Chips';
import { Numerical } from '@/design/plates/Numerical';
import { Caps } from '@/design/primitives/Caps';
import { Eyebrow } from '@/design/primitives/Eyebrow';
import { PressButton } from '@/design/primitives/PressButton';
import { Text } from '@/design/primitives/Text';
import { colors, shape, type } from '@/design/tokens';
import { prescribedSets } from '@/domain/program';
import { Pressable, ScrollView, View } from 'react-native';
import { type AssistanceItem, AssistanceRow } from './AssistanceRow';
import { TodayHeader } from './TodayHeader';
import { type PlateVariant, type TodaySession, WEEK_LABEL } from './today-types';

export type TodayEditorialProps = {
  session: TodaySession;
  plateVariant?: PlateVariant;
  /** Pre-formatted date label, e.g. "Mon Mar 14". Optional. */
  dateLabel?: string;
  /** Optional assistance items. Defaults to three sensible accessory entries. */
  assistanceItems?: AssistanceItem[];
  onStartSet?: (index: number) => void;
  onStartBbb?: () => void;
  onOpenWatch?: () => void;
};

// Plate viz scaled for the embedded top-set card preview.
const PLATE_VIZ_WIDTH = shape.rPill / 4; // 999/4 ≈ 250 — wide enough for hero card
const PLATE_VIZ_HEIGHT = shape.weekLabel + shape.rMd; // 60

function PlateViz({
  variant,
  weight,
}: {
  variant: PlateVariant;
  weight: number;
}) {
  if (variant === 'chips') {
    return <Chips weight={weight} width={PLATE_VIZ_WIDTH} height={PLATE_VIZ_HEIGHT} />;
  }
  if (variant === 'numerical') {
    return <Numerical weight={weight} />;
  }
  return <Barbell weight={weight} width={PLATE_VIZ_WIDTH} height={PLATE_VIZ_HEIGHT} />;
}

const DEFAULT_ASSISTANCE: AssistanceItem[] = [
  { name: 'DB Row', category: 'pull', sets: 5, reps: 10 },
  { name: 'Push-up', category: 'push', sets: 5, reps: 15 },
  { name: 'Hanging Leg Raise', category: 'core', sets: 5, reps: 10 },
];

function defaultDateLabel(): string {
  const d = new Date();
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${dows[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Editorial hero variant of the Today screen — magazine-cover style.
 * Hero lift name with the second word in `hot`, a top-set card with weight +
 * percent + plate viz, a working-sets list, a Boring-But-Big highlight, and an
 * assistance list.
 *
 * Behavioral source: `design-reference/screens-main.jsx` `TodayEditorial`
 * (line 84). If `session.sets` is populated, those drive the UI; otherwise
 * sets are derived from `trainingMax` + `weekOfCycle` via `prescribedSets`.
 */
export function TodayEditorial({
  session,
  plateVariant = 'barbell',
  dateLabel,
  assistanceItems = DEFAULT_ASSISTANCE,
  onStartSet,
  onStartBbb,
  onOpenWatch,
}: TodayEditorialProps) {
  const sets =
    session.sets.length > 0
      ? session.sets
      : prescribedSets(session.trainingMax, session.weekOfCycle).map((s, i) => ({
          index: i,
          type: 'main' as const,
          weight: s.weight,
          reps: s.reps,
          amrap: s.amrap,
          pct: s.percent,
        }));

  const topSet = sets[sets.length - 1];
  if (!topSet) {
    throw new Error('TodayEditorial: prescribedSets returned no sets');
  }
  const eyebrowLabel = `${dateLabel ?? defaultDateLabel()} · week ${session.weekOfCycle}, ${
    WEEK_LABEL[session.weekOfCycle]
  }`;

  const [firstWord, ...restWords] = session.liftLabel.split(' ');
  const restLabel = restWords.length > 0 ? restWords.join(' ') : 'day';

  // BBB target = 50% of training max, snapped to nearest 5.
  const bbbWeight = Math.round((session.trainingMax * 0.5) / 5) * 5;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg0 }}
      contentContainerStyle={{ paddingBottom: shape.rLg * 4 }}
      testID="today-editorial"
    >
      {onOpenWatch ? (
        <TodayHeader session={session} onOpenWatch={onOpenWatch} />
      ) : (
        <TodayHeader session={session} />
      )}

      {/* Date / week eyebrow */}
      <View style={{ paddingHorizontal: shape.rLg, paddingTop: shape.rMd }}>
        <Eyebrow>{eyebrowLabel}</Eyebrow>
      </View>

      {/* Hero lift name — first word ink0, rest hot, split across two lines */}
      <View
        style={{ paddingHorizontal: shape.rLg, paddingTop: shape.rSm, paddingBottom: shape.rMd }}
      >
        <Text variant="hero">
          {firstWord}
          {'\n'}
          <Text variant="hero" tone="hot">
            {restLabel}
          </Text>
        </Text>
      </View>

      {/* Top-set card */}
      <View
        style={{
          marginHorizontal: shape.rLg,
          padding: shape.rLg,
          backgroundColor: colors.bg1,
          borderRadius: shape.rMd,
          marginBottom: shape.rLg,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: shape.rMd,
          }}
        >
          <View style={{ flex: 1 }}>
            <Caps>Top set</Caps>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: shape.rSm,
                marginTop: shape.rXs,
              }}
            >
              <Text variant="bigWeight">{topSet.weight}</Text>
              <Text variant="monoLg" tone="ink2">
                ×{topSet.reps}
                {topSet.amrap ? '+' : ''}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Caps>%TM</Caps>
            <Text
              variant="title"
              tone="hot"
              style={{ marginTop: shape.rXs, fontFamily: type.mono }}
            >
              {Math.round(topSet.pct * 100)}%
            </Text>
          </View>
        </View>
        <View style={{ marginTop: shape.rMd, alignItems: 'center' }}>
          <PlateViz variant={plateVariant} weight={topSet.weight} />
        </View>
      </View>

      {/* Working sets list */}
      <View style={{ paddingHorizontal: shape.rLg }}>
        <Caps style={{ marginBottom: shape.rMd }}>Working sets</Caps>
        <View>
          {sets.map((s, i) => (
            <Pressable
              key={`${session.liftId}-${s.index}`}
              onPress={() => onStartSet?.(i)}
              accessibilityRole="button"
              accessibilityLabel={`Set ${i + 1}, ${s.weight} ${session.unit}, ${s.reps} reps${s.amrap ? ' AMRAP' : ''}`}
              testID={s.amrap ? 'set-amrap' : `set-row-${i}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: shape.rMd,
                borderTopWidth: 1,
                borderTopColor: colors.lineFaint,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: shape.rMd }}>
                <Text
                  variant="caption"
                  tone="ink3"
                  style={{ fontFamily: type.mono, letterSpacing: 1.2, width: shape.rLg }}
                >
                  {`0${i + 1}`}
                </Text>
                <Text
                  style={{
                    fontFamily: type.mono,
                    fontSize: shape.rLg,
                    color: s.amrap ? colors.hot : colors.ink0,
                    letterSpacing: -0.5,
                  }}
                >
                  {s.weight}
                </Text>
                <Text variant="caption" tone="ink2" style={{ fontFamily: type.mono }}>
                  {session.unit}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: shape.rSm }}>
                <Text variant="monoLg" tone={s.amrap ? 'hot' : 'ink1'}>
                  ×{s.reps}
                  {s.amrap ? '+' : ''}
                </Text>
                <Text
                  variant="caption"
                  tone="ink3"
                  style={{ fontFamily: type.mono, letterSpacing: 1.2 }}
                >
                  {Math.round(s.pct * 100)}%
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* BBB section */}
        <View style={{ marginTop: shape.rLg * 2 }}>
          <Caps style={{ marginBottom: shape.rSm }}>Boring but big · 5 × 10 @ 50%</Caps>
          <View
            style={{
              backgroundColor: colors.bg2,
              borderRadius: shape.rMd,
              padding: shape.rMd,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="monoLg" tone="ink0">
                {session.liftLabel.toLowerCase()}
              </Text>
              <Text
                variant="caption"
                tone="ink2"
                style={{ fontFamily: type.mono, marginTop: shape.rXs / 2 }}
              >
                {`5 × 10 @ ${bbbWeight} ${session.unit}`}
              </Text>
            </View>
            <PressButton size="sm" variant="ghost" onPress={() => onStartBbb?.()}>
              Begin
            </PressButton>
          </View>
        </View>

        {/* Assistance section */}
        <View style={{ marginTop: shape.rLg + shape.rSm }}>
          <Caps style={{ marginBottom: shape.rSm }}>Assistance · 50–100 reps each</Caps>
          <View style={{ gap: shape.rSm }}>
            {assistanceItems.map((item) => (
              <AssistanceRow key={item.name} item={item} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default TodayEditorial;
