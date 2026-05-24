import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Card } from '@/design/primitives/Card';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SegRail } from '@/design/primitives/SegRail';
import type { Lift, Unit } from '@/domain/types';
/**
 * Step 3 — Per-lift 1RM entry. The wizard walks each enabled lift in
 * `LIFT_ORDER`; one screen per lift. Composition shell only — view-model
 * lives in `useOneRmEntryState`, layout pieces in sibling files.
 */
import { View } from 'react-native';
import { OnboardingShell } from '../../components/OnboardingShell';
import type { LiftInput, OnboardingMode } from '../../hooks/useOnboardingState';
import { InputFrame } from './InputFrame';
import { LiftHeader } from './LiftHeader';
import { ResultRow } from './ResultRow';
import { StepProgress } from './StepProgress';
import { useOneRmEntryState } from './useOneRmEntryState';

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

const MODE_OPTIONS: ReadonlyArray<{ value: OnboardingMode; label: string }> = [
  { value: 'direct', label: 'I know 1rm' },
  { value: 'calculate', label: 'Calculate' },
];

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
  const { weightStep, tm, isLast, hintVisible, hintCopy } = useOneRmEntryState({
    data,
    computed,
    unit,
    step,
    total,
  });

  return (
    <OnboardingShell
      onBack={onBack}
      label="Setup · lift entry"
      step={step}
      total={total}
      footer={
        <View style={{ gap: 10 }}>
          {hintVisible ? (
            <CapsLabel style={{ textAlign: 'center' }} testID="onboarding-onerm-hint">
              {hintCopy}
            </CapsLabel>
          ) : null}
          <PrimaryPillButton onPress={onNext} disabled={!computed} testID="onboarding-onerm-next">
            {isLast ? 'Review' : 'Next lift'}
          </PrimaryPillButton>
        </View>
      }
    >
      <StepProgress step={step} total={total} />
      <LiftHeader lift={lift} step={step} total={total} />

      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <SegRail<OnboardingMode>
          value={data.mode}
          options={MODE_OPTIONS}
          onChange={(v) => onChange({ mode: v })}
        />
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 20, flex: 1 }}>
        <InputFrame data={data} unit={unit} weightStep={weightStep} onChange={onChange} />

        <Card borders="topBottom" tone="strong" style={{ marginTop: 28 }}>
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
        </Card>
      </View>
    </OnboardingShell>
  );
}
