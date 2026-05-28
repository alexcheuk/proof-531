import { CapsLabel } from '@/design/primitives/CapsLabel';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
/**
 * Step 4 — Review the computed training maxes and commit. Ported from
 * `the PWA reference`.
 */
import { View } from 'react-native';
import { OnboardingShell } from '../../components/OnboardingShell';
import { TmTable } from './TmTable';

export interface ReviewProps {
  enabledLifts: Lift[];
  computed: Partial<Record<Lift, number>>;
  unit: Unit;
  onBack: () => void;
  onFinish: () => void;
  finishing?: boolean;
}

export function Review({ enabledLifts, computed, unit, onBack, onFinish, finishing }: ReviewProps) {
  const { layout } = useTheme();

  return (
    <OnboardingShell
      onBack={onBack}
      label="Setup · review"
      footer={
        <PrimaryPillButton
          onPress={onFinish}
          disabled={finishing === true}
          testID="onboarding-finish"
        >
          Start cycle 01
        </PrimaryPillButton>
      }
    >
      <View style={{ paddingHorizontal: layout.gutter, paddingTop: 28, paddingBottom: 12 }}>
        <CapsLabel style={{ marginBottom: 6 }}>Your numbers</CapsLabel>
        <Text
          variant="sans"
          weight="bold"
          size={40}
          color="ink0"
          style={{ letterSpacing: -1.4, lineHeight: 46 }}
        >
          Ready to{' '}
          <Text variant="sans" weight="medium" size={40} color="ink2">
            lift.
          </Text>
        </Text>
        <Text
          variant="sans"
          weight="regular"
          size={13}
          color="ink1"
          style={{ lineHeight: 20, marginTop: 12, maxWidth: 320 }}
        >
          Cycle 1, day 1 starts at 65% of your training max. Five reps, three sets, the last one
          all-out.
        </Text>
      </View>

      <View style={{ paddingHorizontal: layout.gutter, paddingTop: 12 }}>
        <CapsLabel style={{ marginBottom: 8 }}>Training maxes</CapsLabel>
        <TmTable enabledLifts={enabledLifts} computed={computed} unit={unit} />
        <Text
          variant="sans"
          weight="regular"
          size={13}
          color="ink2"
          style={{ marginTop: 14, lineHeight: 19, maxWidth: 320 }}
        >
          Your training max is{' '}
          <Text variant="sans" weight="bold" size={13} color="ink0">
            90% of your 1RM
          </Text>
          {` — the working number you build from. Wendler's rule of thumb: train below your max so every cycle adds weight cleanly.`}
        </Text>
      </View>
    </OnboardingShell>
  );
}
