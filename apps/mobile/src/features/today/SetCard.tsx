import { Icon } from '@/design/icons';
import { Barbell } from '@/design/plates/Barbell';
import { Chips } from '@/design/plates/Chips';
import { Numerical } from '@/design/plates/Numerical';
import { Caps } from '@/design/primitives/Caps';
import { Card } from '@/design/primitives/Card';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape } from '@/design/tokens';
import { Pressable, View } from 'react-native';
import type { PlateVariant } from './today-types';

export type SetCardProps = {
  index: number;
  weight: number;
  reps: number;
  amrap: boolean;
  pct: number;
  unit: 'lbs' | 'kg';
  done?: boolean;
  next?: boolean;
  plateVariant?: PlateVariant;
  onPress?: () => void;
};

// Embedded plate viz width on the right of each card. Sized for an at-a-glance
// preview, not an interactive plate calculator.
const PLATE_VIZ_WIDTH = shape.rPill / 8; // 999/8 ≈ 124 — close to spec "~120"
const PLATE_VIZ_HEIGHT = shape.weekLabel; // 48 — short row that fits in the card

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

export function SetCard({
  index,
  weight,
  reps,
  amrap,
  pct,
  unit,
  done,
  next,
  plateVariant = 'barbell',
  onPress,
}: SetCardProps) {
  const testID = done ? `set-card-done-${index}` : next ? 'set-card-next' : `set-card-${index}`;

  const accessibilityLabel = `Set ${index + 1}, ${weight} ${unit}, ${reps} reps${amrap ? ' AMRAP' : ''}${done ? ', done' : ''}${next ? ', next up' : ''}`;

  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: shape.rMd,
        opacity: done ? 0.6 : 1,
      }}
    >
      <View style={{ flex: 1, gap: shape.rXs }}>
        <Caps>{`Set ${index + 1} · ${Math.round(pct * 100)}%`}</Caps>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: shape.rSm }}>
          <WeightNum value={weight} size="md" />
          <Text variant="small" tone="ink2">{`× ${reps}${amrap ? '+' : ''} ${unit}`}</Text>
        </View>
      </View>
      <View>
        <PlateViz variant={plateVariant} weight={weight} />
      </View>
      {done ? (
        <View style={{ position: 'absolute', top: 0, right: 0 }}>
          <Icon name="check" color={colors.lime} />
        </View>
      ) : null}
    </View>
  );

  const card = <Card padded>{body}</Card>;

  // Hot border overlay when this is the next-up set. Border width uses the
  // smallest shape token (rXs = 4) since `tokens.ts` is the only place raw
  // pixel literals are allowed; the slightly thicker stroke reads as a
  // confident "active" cue.
  const overlay = next ? (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: shape.rMd,
        borderWidth: shape.rXs,
        borderColor: colors.hot,
      }}
    />
  ) : null;

  const wrapper = (
    <View>
      {card}
      {overlay}
    </View>
  );

  if (!onPress) {
    return (
      <View testID={testID} accessibilityLabel={accessibilityLabel}>
        {wrapper}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {wrapper}
    </Pressable>
  );
}

export default SetCard;
