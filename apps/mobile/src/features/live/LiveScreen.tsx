import { colors } from '@/design/tokens';
import { epley, isPR } from '@/domain/e1rm';
import { useCallback, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LiftingPhase } from './LiftingPhase';
import { RestPhase } from './RestPhase';
import { useRestTimer } from './useRestTimer';

/**
 * Minimum-viable session types. P8-today-data will replace these with the
 * canonical Drizzle-derived shapes; until then we keep them local so this
 * feature is self-contained and doesn't block on the data layer.
 */
export type PlateVariant = 'barbell' | 'chips' | 'numerical';

export type TodaySessionSetType = 'warmup' | 'main' | 'bbb';

export type TodaySessionSet = {
  index: number;
  type: TodaySessionSetType;
  prescribedWeight: number;
  prescribedReps: number;
  amrap: boolean;
};

export type TodaySession = {
  liftId: string;
  liftLabel: string;
  unit: 'lbs' | 'kg';
  sets: TodaySessionSet[];
};

type Phase = 'lifting' | 'rest';

export type LiveScreenProps = {
  session: TodaySession;
  setIndex: number;
  plateVariant?: PlateVariant;
  history?: number[];
  onComplete: (input: { index: number; actualReps: number }) => void;
  onClose: () => void;
  onPRDetected?: (input: { liftId: string; newE1RM: number }) => void;
};

// Rest defaults (seconds) by set type. Pure constant — not a token, just a
// product rule. Will move into `domain/program/` if/when other surfaces need it.
const REST_BY_TYPE: Record<TodaySessionSetType, number> = {
  warmup: 60,
  main: 180,
  bbb: 60,
};

export function LiveScreen({
  session,
  setIndex,
  history,
  onComplete,
  onClose,
  onPRDetected,
}: LiveScreenProps) {
  const [phase, setPhase] = useState<Phase>('lifting');
  const timer = useRestTimer();

  const set = session.sets[setIndex];
  const nextSet = set ? session.sets[setIndex + 1] : undefined;

  const handleComplete = useCallback(
    (actualReps: number) => {
      if (!set) return;
      if (set.amrap && actualReps > 0) {
        const e1 = epley(set.prescribedWeight, actualReps);
        if (isPR(e1, history ?? [])) {
          onPRDetected?.({ liftId: session.liftId, newE1RM: e1 });
        }
      }
      onComplete({ index: setIndex, actualReps });
      timer.start();
      setPhase('rest');
    },
    [set, history, onPRDetected, onComplete, setIndex, session.liftId, timer],
  );

  if (!set) return null;

  const targetSeconds = REST_BY_TYPE[set.type];

  return (
    <View style={ROOT} testID="live-screen">
      {phase === 'lifting' ? (
        <LiftingPhase set={set} unit={session.unit} onComplete={handleComplete} />
      ) : (
        <RestPhase
          targetSeconds={targetSeconds}
          nextSet={nextSet}
          unit={session.unit}
          elapsed={timer.elapsed}
          onNext={onClose}
        />
      )}
    </View>
  );
}

const ROOT: ViewStyle = {
  flex: 1,
  backgroundColor: colors.bg0,
};
