import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SegRail } from '@/design/primitives/SegRail';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
/**
 * Step 1 — Intro screen. Welcome copy + unit picker + Begin CTA.
 * Ported from `~/Development/531-pwa/src/features/onboarding/steps/Intro.tsx`.
 */
import { View, type ViewStyle } from 'react-native';
import { OnboardingShell } from '../components/OnboardingShell';

export interface IntroProps {
  onNext: () => void;
  unit: Unit;
  onUnitChange: (next: Unit) => void;
}

export function Intro({ onNext, unit, onUnitChange }: IntroProps) {
  return (
    <OnboardingShell
      footer={
        <PrimaryPillButton onPress={onNext} testID="onboarding-begin">
          Begin
        </PrimaryPillButton>
      }
    >
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 36 }}>
        <Text
          variant="mono"
          weight="medium"
          size={10}
          color="ink2"
          style={{ letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 14 }}
        >
          A program by Jim Wendler
        </Text>

        <Text
          variant="sans"
          weight="bold"
          size={56}
          color="ink0"
          style={{ letterSpacing: -2.52, lineHeight: 64 }}
        >
          Get strong
        </Text>
        <Text
          variant="sans"
          weight="medium"
          size={56}
          color="ink2"
          style={{ letterSpacing: -2.52, lineHeight: 64 }}
        >
          slowly.
        </Text>

        <Text
          variant="sans"
          weight="regular"
          size={14}
          color="ink1"
          style={{ lineHeight: 22, marginTop: 24, maxWidth: 320 }}
        >
          Four lifts. Four days. Small jumps every cycle. We calculate your training max so the
          program does the math — you just lift.
        </Text>

        <View style={{ marginTop: 32 }}>
          <Bullet n="01" label="Enter your four 1-rep maxes" sub="or use the calculator below" />
          <Bullet n="02" label="We set your training max to 90%" sub="that's your working number" />
          <Bullet n="03" label="Lift for 4 days, repeat" sub="add weight, every time" last />
        </View>

        <View style={{ marginTop: 32 }}>
          <Text
            variant="mono"
            weight="medium"
            size={10}
            color="ink2"
            style={{ letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 12 }}
          >
            Unit · pick yours
          </Text>
          <SegRail<Unit>
            value={unit}
            options={[
              { value: 'lbs', label: 'Pounds · lb' },
              { value: 'kg', label: 'Kilograms · kg' },
            ]}
            onChange={onUnitChange}
            testID="onboarding-unit"
          />
          <Text
            variant="mono"
            weight="medium"
            size={9}
            color="ink3"
            style={{ letterSpacing: 1.26, textTransform: 'uppercase', marginTop: 10 }}
          >
            you can change display later in settings
          </Text>
        </View>
      </View>
    </OnboardingShell>
  );
}

interface BulletProps {
  n: string;
  label: string;
  sub: string;
  last?: boolean;
}

function Bullet({ n, label, sub, last }: BulletProps) {
  const { colors } = useTheme();

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderBottomWidth: last ? 1 : 0,
    borderBottomColor: colors.lineStrong,
    gap: 14,
  };

  return (
    <View style={rowStyle}>
      <Text
        variant="mono"
        weight="bold"
        size={11}
        color="ink0"
        style={{ letterSpacing: 1.54, width: 36 }}
      >
        {n}
      </Text>
      <View style={{ flex: 1 }}>
        <Text variant="sans" weight="semibold" size={15} color="ink0">
          {label}
        </Text>
        <Text
          variant="mono"
          weight="medium"
          size={9}
          color="ink2"
          style={{ letterSpacing: 1.62, textTransform: 'uppercase', marginTop: 4 }}
        >
          {sub}
        </Text>
      </View>
    </View>
  );
}
