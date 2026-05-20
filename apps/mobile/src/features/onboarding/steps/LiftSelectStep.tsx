import { Caps } from '@/design/primitives/Caps';
import { Eyebrow } from '@/design/primitives/Eyebrow';
import { PressButton } from '@/design/primitives/PressButton';
import { SegRail } from '@/design/primitives/SegRail';
import { Text } from '@/design/primitives/Text';
import { colors, shape, type } from '@/design/tokens';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { OnboardingShell } from '../OnboardingShell';
import { LIFT_META, LIFT_ORDER, type LiftId } from '../lift-meta';

export type LiftSelectStepProps = {
  unit: 'lbs' | 'kg';
  enabled: Record<LiftId, boolean>;
  onUnitChange: (unit: 'lbs' | 'kg') => void;
  onToggleLift: (lift: LiftId) => void;
  onNext: () => void;
};

const LIFT_CATEGORY: Record<LiftId, string> = {
  squat: 'lower body',
  bench: 'upper body',
  deadlift: 'lower body',
  press: 'upper body',
};

export function LiftSelectStep({
  unit,
  enabled,
  onUnitChange,
  onToggleLift,
  onNext,
}: LiftSelectStepProps) {
  const enabledCount = LIFT_ORDER.filter((l) => enabled[l]).length;
  const anyEnabled = enabledCount > 0;
  return (
    <OnboardingShell
      footer={
        <PressButton
          size="lg"
          variant="ember"
          onPress={onNext}
          disabled={!anyEnabled}
          testID="select-next"
        >
          Next →
        </PressButton>
      }
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: shape.rLg }}
        showsVerticalScrollIndicator={false}
      >
        <Eyebrow style={{ marginBottom: shape.rSm }}>Step 1 of 4</Eyebrow>
        <Text variant="display" accessibilityRole="header" testID="select-header">
          Which lifts?
        </Text>
        <Text tone="ink1" style={{ marginTop: shape.rMd, lineHeight: shape.rLg + shape.rXs }}>
          Toggle the ones you want to program. Most people stick with the classic four.
        </Text>

        <View style={{ marginTop: shape.rLg, gap: shape.rSm }}>
          <Caps>Units</Caps>
          <SegRail<'lbs' | 'kg'>
            options={['lbs', 'kg']}
            value={unit}
            onChange={onUnitChange}
            testID="unit-toggle"
          />
        </View>

        <View
          style={{
            marginTop: shape.rLg,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: shape.rSm,
          }}
        >
          {LIFT_ORDER.map((lift) => {
            const isOn = enabled[lift];
            const cardStyle: ViewStyle = {
              flexBasis: '48%',
              flexGrow: 1,
              backgroundColor: isOn ? colors.bg2 : colors.bg1,
              borderColor: isOn ? colors.hot : colors.line,
              borderWidth: shape.hairline,
              borderRadius: shape.rMd,
              padding: shape.rLg,
              minHeight: shape.rLg * 6,
              justifyContent: 'space-between',
            };
            return (
              <Pressable
                key={lift}
                accessibilityRole="button"
                accessibilityState={{ selected: isOn }}
                onPress={() => onToggleLift(lift)}
                style={cardStyle}
                testID={`lift-toggle-${lift}`}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    minHeight: shape.rSm,
                  }}
                >
                  {isOn ? (
                    <View
                      style={{
                        width: shape.rSm,
                        height: shape.rSm,
                        borderRadius: shape.rPill,
                        backgroundColor: colors.hot,
                      }}
                    />
                  ) : null}
                </View>
                <View style={{ marginTop: shape.rMd }}>
                  <Text variant="logo" tone={isOn ? 'ink0' : 'ink1'}>
                    {LIFT_META[lift].label}
                  </Text>
                  <Text
                    tone="ink2"
                    style={{
                      fontFamily: type.mono,
                      fontSize: shape.rMd - 1,
                      textTransform: 'uppercase',
                      letterSpacing: shape.hairline,
                      marginTop: shape.rXs,
                    }}
                  >
                    {LIFT_CATEGORY[lift]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </OnboardingShell>
  );
}

export default LiftSelectStep;
