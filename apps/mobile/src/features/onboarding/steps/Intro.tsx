import { CapsLabel } from '@/design/primitives/CapsLabel';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Row } from '@/design/primitives/Row';
import { SegRail } from '@/design/primitives/SegRail';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Unit } from '@/domain/types';
/**
 * Step 1 — Intro screen. Welcome copy + unit picker + Begin CTA.
 */
import { View, type ViewStyle } from 'react-native';
import { OnboardingShell } from '../components/OnboardingShell';

export interface IntroProps {
  onNext: () => void;
  unit: Unit;
  onUnitChange: (next: Unit) => void;
}

const UNIT_OPTIONS = [
  { value: 'lbs' as const, label: 'Pounds · lb' },
  { value: 'kg' as const, label: 'Kilograms · kg' },
];

export function Intro({ onNext, unit, onUnitChange }: IntroProps) {
  const { layout, spacing } = useTheme();
  return (
    <OnboardingShell
      footer={
        <PrimaryPillButton onPress={onNext} testID="onboarding-begin">
          Begin
        </PrimaryPillButton>
      }
    >
      <View style={{ flex: 1, paddingHorizontal: layout.gutter, paddingTop: spacing.xxl + 4 }}>
        <CapsLabel style={{ marginBottom: spacing.md + 2 }}>A program by Jim Wendler</CapsLabel>

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
          style={{ lineHeight: 22, marginTop: spacing.xl, maxWidth: 320 }}
        >
          Four lifts. Four days. Small jumps every cycle. We calculate your training max so the
          program does the math — you just lift.
        </Text>

        <View style={{ marginTop: spacing.xxl }}>
          <Bullet n="01" label="Enter your four 1-rep maxes" sub="or use the calculator below" />
          <Bullet n="02" label="We set your training max to 90%" sub="that's your working number" />
          <Bullet n="03" label="Lift for 4 days, repeat" sub="add weight, every time" last />
        </View>

        <View style={{ marginTop: spacing.xxl }}>
          <CapsLabel style={{ marginBottom: spacing.md }}>Unit · pick yours</CapsLabel>
          <SegRail<Unit>
            value={unit}
            options={UNIT_OPTIONS}
            onChange={onUnitChange}
            testID="onboarding-unit"
          />
          <CapsLabel size="xs" color="ink3" style={{ marginTop: spacing.sm + 2 }}>
            you can change display later in settings
          </CapsLabel>
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
  const { colors, spacing } = useTheme();

  const rowStyle: ViewStyle = {
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderBottomWidth: last ? 1 : 0,
    borderBottomColor: colors.lineStrong,
  };

  return (
    <Row align="flex-start" gap="md" style={rowStyle}>
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
        <CapsLabel size="xs" style={{ marginTop: spacing.xs }}>
          {sub}
        </CapsLabel>
      </View>
    </Row>
  );
}
