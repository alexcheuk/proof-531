import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Card } from '@/design/primitives/Card';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
/**
 * Step 2 — Pick the lifts you want to train. Ported from
 * `the PWA reference`.
 */
import { View } from 'react-native';
import { LiftToggleRow } from '../components/LiftToggleRow';
import { OnboardingShell } from '../components/OnboardingShell';
import { LIFT_ORDER } from '../lifts';

export interface PickLiftsProps {
  enabled: Lift[];
  unit: Unit;
  onToggle: (lift: Lift) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PickLifts({ enabled, unit, onToggle, onBack, onNext }: PickLiftsProps) {
  const { layout } = useTheme();
  const count = enabled.length;
  const calloutCopy =
    count === 1
      ? 'Single-lift focus · 4 sessions per cycle'
      : `${count} lifts · ${count * 4} sessions per cycle`;
  const ctaCopy = `Continue · ${count} ${count === 1 ? 'lift' : 'lifts'}`;

  return (
    <OnboardingShell
      onBack={onBack}
      label="Setup · step 01 of 02"
      footer={
        <PrimaryPillButton
          onPress={onNext}
          disabled={count === 0}
          testID="onboarding-picklifts-next"
        >
          {ctaCopy}
        </PrimaryPillButton>
      }
    >
      <View style={{ paddingHorizontal: layout.gutter, paddingTop: 28, paddingBottom: 16 }}>
        <Text
          variant="sans"
          weight="bold"
          size={44}
          color="ink0"
          style={{ letterSpacing: -1.54, lineHeight: 52 }}
        >
          Which lifts{'\n'}
          <Text variant="sans" weight="medium" size={44} color="ink2">
            are you training?
          </Text>
        </Text>
        <Text
          variant="sans"
          weight="regular"
          size={13}
          color="ink1"
          style={{ lineHeight: 20, marginTop: 14, maxWidth: 320 }}
        >
          One, two, or all four. You can run 5/3/1 on a single lift if that's all you care about.
          Add or remove later in settings.
        </Text>
      </View>

      <View style={{ paddingHorizontal: layout.gutter, paddingTop: 8, flex: 1 }}>
        {LIFT_ORDER.map((lift, i) => (
          <LiftToggleRow
            key={lift}
            lift={lift}
            index={i}
            isFirst={i === 0}
            isLast={i === LIFT_ORDER.length - 1}
            selected={enabled.includes(lift)}
            unit={unit}
            onToggle={() => onToggle(lift)}
          />
        ))}

        <Card tone="dashed" py="md" px="md" style={{ marginTop: 16 }}>
          <CapsLabel color="ink1" style={{ lineHeight: 16 }}>
            {calloutCopy}
          </CapsLabel>
        </Card>
      </View>
    </OnboardingShell>
  );
}
