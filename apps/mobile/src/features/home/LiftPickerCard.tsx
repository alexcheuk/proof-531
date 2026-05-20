import { Icon } from '@/design/icons';
import { Caps } from '@/design/primitives/Caps';
import { Text } from '@/design/primitives/Text';
import { WeightNum } from '@/design/primitives/WeightNum';
import { colors, shape, type } from '@/design/tokens';
import { Pressable, View } from 'react-native';

export type LiftPickerCardProps = {
  liftId: string;
  liftLabel: string;
  trainingMax: number;
  topWeight: number;
  topReps: number;
  amrap: boolean;
  pct: number;
  unit: 'lbs' | 'kg';
  large?: boolean;
  /** Days since the last session for this lift. `undefined` → "not started". */
  lastDaysAgo?: number | undefined;
  lastTopReps?: number | undefined;
  onPress?: (() => void) | undefined;
};

/**
 * Per-lift card in the Home picker grid.
 *
 * Behavioral source: `design-reference/screens-meta.jsx` `LiftPickerCard`
 * (lines 182-291). Layout: lift name (uppercase display), top-set caption +
 * weight × reps row, bottom "last session" strip with arrow-right affordance.
 */
export function LiftPickerCard({
  liftId,
  liftLabel,
  topWeight,
  topReps,
  amrap,
  pct,
  unit,
  large = false,
  lastDaysAgo,
  lastTopReps,
  onPress,
}: LiftPickerCardProps) {
  const padding = large ? shape.rLg : shape.rMd;
  const cardGap = large ? shape.rSm + shape.rXs : shape.rSm;
  // Reference uses 30/18 for the lift name; pick our closest variants.
  // Default → `monoLg` (18). Large → `display` (44, slightly bigger than the
  // 30 reference but the next-larger variant we already ship).
  const lastLabel =
    lastDaysAgo === undefined
      ? 'not started'
      : lastDaysAgo === 0
        ? `today${lastTopReps != null ? ` · ${lastTopReps} reps` : ''}`
        : `${lastDaysAgo}d ago${lastTopReps != null ? ` · ${lastTopReps} reps` : ''}`;
  const lastToneColor = lastDaysAgo === undefined ? colors.ink3 : colors.ink2;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liftLabel}
      testID={`lift-picker-card-${liftId}`}
      onPress={onPress}
      style={{
        backgroundColor: colors.bg1,
        borderWidth: shape.hairline,
        borderColor: colors.line,
        borderRadius: shape.rMd,
        padding,
        gap: cardGap,
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Lift name */}
      <View>
        <Text
          variant={large ? 'display' : 'monoLg'}
          style={{
            fontFamily: type.display,
            textTransform: 'uppercase',
            letterSpacing: large ? -1 : -0.4,
            lineHeight: large ? undefined : shape.rLg,
            fontWeight: '600',
          }}
        >
          {liftLabel}
        </Text>
        {large ? (
          <Caps
            style={{
              color: colors.ink2,
              letterSpacing: 1.1,
              marginTop: shape.rXs,
              textTransform: 'lowercase',
            }}
          >
            {liftLabel.toLowerCase()}
          </Caps>
        ) : null}
      </View>

      {/* Top set */}
      <View>
        <Caps style={{ color: colors.ink3, letterSpacing: 1.2, marginBottom: shape.rXs }}>
          {`Top set · ${Math.round(pct * 100)}%`}
        </Caps>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: shape.rXs }}>
          <WeightNum value={topWeight} size={large ? 'lg' : 'md'} />
          <Caps style={{ color: colors.ink2 }}>{unit}</Caps>
          <Text
            style={{
              fontFamily: type.mono,
              fontSize: large ? shape.rLg : shape.rMd + shape.hairline,
              fontWeight: '500',
              color: colors.ink1,
              marginLeft: shape.rXs,
            }}
          >
            {`× ${topReps}${amrap ? '+' : ''}`}
          </Text>
        </View>
      </View>

      {/* Last session strip */}
      <View
        style={{
          marginTop: 'auto',
          paddingTop: shape.rSm + shape.rXs / 2,
          borderTopWidth: shape.hairline,
          borderTopColor: colors.line,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Caps style={{ color: lastToneColor, letterSpacing: 1.2 }}>{lastLabel}</Caps>
        <Icon name="arrow-right" size={shape.rMd + shape.hairline} color={colors.ink2} stroke={2} />
      </View>
    </Pressable>
  );
}

export default LiftPickerCard;
