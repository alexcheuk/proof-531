import type { Session } from '@/data/accessors/session';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { View } from 'react-native';
import { computeCycleHint } from '../achievements';
import { SessionListRow } from './SessionListRow';

export type CycleSectionProps = {
  cycle: number;
  sessions: Session[];
  prSessionIds: ReadonlySet<number>;
  /** Tapping a PR chip on any row inside this section fires this callback. */
  onPressPr?: (lift: Lift) => void;
};

export function CycleSection({ cycle, sessions, prSessionIds, onPressPr }: CycleSectionProps) {
  const { layout } = useTheme();
  const hint = computeCycleHint(sessions, prSessionIds);
  return (
    <View
      style={{ paddingHorizontal: layout.gutter, paddingTop: 24 }}
      testID={`history-cycle-${cycle}`}
    >
      <Row justify="space-between" align="baseline" style={{ marginBottom: 4 }}>
        <CapsLabel weight="semibold" color="ink1">
          {`Cycle ${String(cycle).padStart(2, '0')}`}
        </CapsLabel>
        <CapsLabel size="xs" color="ink3">
          {hint}
        </CapsLabel>
      </Row>
      <View>
        {sessions.map((s, i) => (
          <SessionListRow
            key={s.id}
            session={s}
            first={i === 0}
            hasPr={prSessionIds.has(s.id)}
            {...(onPressPr ? { onPressPr } : {})}
          />
        ))}
      </View>
    </View>
  );
}
