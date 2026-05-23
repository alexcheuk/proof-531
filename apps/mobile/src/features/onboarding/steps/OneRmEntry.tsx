import { NumberStepper } from '@/design/primitives/NumberStepper';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SegRail } from '@/design/primitives/SegRail';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import type { Lift, Unit } from '@/domain/types';
import { displayUnit, trainingMaxFrom } from '@/domain/units';
/**
 * Step 3 — Per-lift 1RM entry. The wizard walks each enabled lift in
 * `LIFT_ORDER`; one screen per lift. Ported from
 * `~/Development/531-pwa/src/features/onboarding/steps/OneRmEntry.tsx`.
 */
import { View, type ViewStyle } from 'react-native';
import { OnboardingShell } from '../components/OnboardingShell';
import type { LiftInput, OnboardingMode } from '../hooks/useOnboardingState';
import { LIFT_META } from '../lifts';

export interface OneRmEntryProps {
  lift: Lift;
  /** 1-based for display. */
  step: number;
  total: number;
  data: LiftInput;
  /** Estimated 1RM, integer (rounded for display + persistence). */
  computed: number;
  unit: Unit;
  onChange: (patch: Partial<LiftInput>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function OneRmEntry({
  lift,
  step,
  total,
  data,
  computed,
  unit,
  onChange,
  onBack,
  onNext,
}: OneRmEntryProps) {
  const { colors } = useTheme();
  const meta = LIFT_META[lift];
  const tm = trainingMaxFrom(computed, unit);
  const weightStep = unit === 'kg' ? 2.5 : 5;
  const isLast = step === total;

  const tickRow: ViewStyle = {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 14,
    gap: 4,
  };

  return (
    <OnboardingShell
      onBack={onBack}
      label="Setup · lift entry"
      step={step}
      total={total}
      footer={
        <PrimaryPillButton onPress={onNext} disabled={!computed} testID="onboarding-onerm-next">
          {isLast ? 'Review' : 'Next lift'}
        </PrimaryPillButton>
      }
    >
      <View style={tickRow}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            // biome-ignore lint/suspicious/noArrayIndexKey: ticks are static count
            key={i}
            style={{
              flex: 1,
              height: 3,
              backgroundColor: i < step ? colors.ink0 : colors.lineStrong,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 }}>
        <Text
          variant="mono"
          weight="medium"
          size={10}
          color="ink2"
          style={{ letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 6 }}
        >
          {`Lift ${String(step).padStart(2, '0')} of ${String(total).padStart(2, '0')}`}
        </Text>
        <Text
          variant="sans"
          weight="bold"
          size={40}
          color="ink0"
          style={{ letterSpacing: -1.4, lineHeight: 40 }}
        >
          {`${meta.label}.`}
        </Text>
        <Text variant="sans" weight="medium" size={13} color="ink2" style={{ marginTop: 4 }}>
          {`${meta.italic}.`}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <SegRail<OnboardingMode>
          value={data.mode}
          options={[
            { value: 'direct', label: 'I know 1rm' },
            { value: 'calculate', label: 'Calculate' },
          ]}
          onChange={(v) => onChange({ mode: v })}
        />
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 20, flex: 1 }}>
        {data.mode === 'direct' ? (
          <NumberStepper
            label="One-rep max"
            value={data.weight}
            unit={unit}
            step={weightStep}
            min={0}
            max={9999}
            onChange={(v) => onChange({ weight: v })}
          />
        ) : (
          <>
            <NumberStepper
              label="Weight you lifted"
              value={data.weight}
              unit={unit}
              step={weightStep}
              min={0}
              max={9999}
              onChange={(v) => onChange({ weight: v })}
            />
            <View style={{ height: 16 }} />
            <NumberStepper
              label="For how many reps"
              value={data.reps}
              unit="reps"
              step={1}
              min={1}
              max={15}
              onChange={(v) => onChange({ reps: v })}
            />
          </>
        )}

        <View
          style={{
            marginTop: 28,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.lineStrong,
          }}
        >
          <ResultRow
            primary="Estimated 1RM"
            secondary={
              data.mode === 'direct' ? 'as entered' : `${data.weight} × ${data.reps} · epley`
            }
            value={computed || 0}
            unit={unit}
            valueSize={28}
            first
          />
          <ResultRow
            primary="Training max"
            secondary="90% of 1rm · your working number"
            value={tm}
            unit={unit}
            valueSize={22}
          />
        </View>
      </View>
    </OnboardingShell>
  );
}

interface ResultRowProps {
  primary: string;
  secondary: string;
  value: number;
  unit: Unit;
  valueSize: number;
  first?: boolean;
}

function ResultRow({ primary, secondary, value, unit, valueSize, first }: ResultRowProps) {
  const { colors } = useTheme();

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: first ? 0 : 1,
    borderTopColor: colors.lineFaint,
    gap: 12,
  };

  return (
    <View style={rowStyle}>
      <View style={{ flex: 1 }}>
        <Text variant="sans" weight="semibold" size={15} color="ink0">
          {primary}
        </Text>
        <Text
          variant="mono"
          weight="medium"
          size={10}
          color="ink2"
          style={{ letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 4 }}
        >
          {secondary}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text
          variant="sans"
          weight="bold"
          size={valueSize}
          color="ink0"
          style={{ letterSpacing: -valueSize * 0.035 }}
        >
          {String(value)}
        </Text>
        <Text
          variant="mono"
          weight="semibold"
          size={10}
          color="ink2"
          style={{ letterSpacing: 1.8, textTransform: 'uppercase' }}
        >
          {displayUnit(unit)}
        </Text>
      </View>
    </View>
  );
}
