import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit, trainingMaxFrom } from '@/domain/units';
/**
 * Step 4 — Review the computed training maxes and commit. Ported from
 * `~/Development/531-pwa/src/features/onboarding/steps/Review.tsx`.
 */
import { View, type ViewStyle } from 'react-native';
import { OnboardingShell } from '../components/OnboardingShell';
import { LIFT_META } from '../lifts';

export interface ReviewProps {
  enabledLifts: Lift[];
  computed: Partial<Record<Lift, number>>;
  unit: Unit;
  onBack: () => void;
  onFinish: () => void;
  finishing?: boolean;
}

export function Review({ enabledLifts, computed, unit, onBack, onFinish, finishing }: ReviewProps) {
  const { colors } = useTheme();

  const tableStyle: ViewStyle = {
    borderWidth: 1,
    borderColor: colors.ink0,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.ink0,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink0,
  };

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
      <View style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 12 }}>
        <Text
          variant="mono"
          weight="medium"
          size={10}
          color="ink2"
          style={{ letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 6 }}
        >
          Your numbers
        </Text>
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

      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Text
          variant="mono"
          weight="medium"
          size={10}
          color="ink2"
          style={{ letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 8 }}
        >
          Training maxes
        </Text>
        <View style={tableStyle}>
          <View style={headerStyle}>
            <HeaderCell width={24}>№</HeaderCell>
            <HeaderCell flex>Lift</HeaderCell>
            <HeaderCell width={80} right>
              1RM
            </HeaderCell>
            <HeaderCell width={80} right>
              TM (90%)
            </HeaderCell>
          </View>
          {enabledLifts.map((lift, i) => {
            const oneRM = computed[lift] ?? 0;
            const tm = trainingMaxFrom(oneRM, unit);
            const isLast = i === enabledLifts.length - 1;
            return (
              <View
                key={lift}
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  alignItems: 'flex-end',
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: colors.line,
                }}
              >
                <View style={{ width: 24 }}>
                  <Text variant="mono" weight="bold" size={11} color="ink3">
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="sans" weight="semibold" size={15} color="ink0">
                    {LIFT_META[lift].label}
                  </Text>
                </View>
                <View style={{ width: 80, alignItems: 'flex-end' }}>
                  <Text
                    variant="sans"
                    weight="medium"
                    size={16}
                    color="ink2"
                    style={{ letterSpacing: -0.32 }}
                  >
                    {String(oneRM)}
                  </Text>
                </View>
                <View style={{ width: 80, alignItems: 'flex-end' }}>
                  <Text
                    variant="sans"
                    weight="bold"
                    size={18}
                    color="ink0"
                    style={{ letterSpacing: -0.45 }}
                  >
                    {String(tm)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <Text
          variant="mono"
          weight="medium"
          size={9}
          color="ink3"
          style={{
            letterSpacing: 1.62,
            textTransform: 'uppercase',
            marginTop: 8,
            textAlign: 'right',
          }}
        >
          {`all values in ${displayUnit(unit)}`}
        </Text>
      </View>
    </OnboardingShell>
  );
}

interface HeaderCellProps {
  children: string;
  width?: number;
  flex?: boolean;
  right?: boolean;
}

function HeaderCell({ children, width, flex, right }: HeaderCellProps) {
  const cellStyle: ViewStyle = {
    ...(width ? { width } : {}),
    ...(flex ? { flex: 1 } : {}),
    ...(right ? { alignItems: 'flex-end' } : {}),
  };
  return (
    <View style={cellStyle}>
      <Text
        variant="mono"
        weight="bold"
        size={9}
        color="bg0"
        style={{ letterSpacing: 1.98, textTransform: 'uppercase' }}
      >
        {children}
      </Text>
    </View>
  );
}
