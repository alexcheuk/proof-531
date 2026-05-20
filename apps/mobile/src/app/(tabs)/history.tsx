import { HistoryScreen } from '@/features/history/HistoryScreen';
import type { HistorySession } from '@/features/history/HistorySessionRow';

const MOCK_LIFTS = [
  { id: 'squat', label: 'Squat' },
  { id: 'bench', label: 'Bench' },
  { id: 'deadlift', label: 'Deadlift' },
];

const MOCK_SESSIONS: HistorySession[] = [
  {
    id: 1,
    completedAt: new Date('2026-05-14T12:00:00Z'),
    liftId: 'squat',
    liftLabel: 'Squat',
    week: 3,
    cycleNumber: 3,
    topWeight: 315,
    topReps: 5,
    amrap: true,
    e1rm: 367,
    isPR: true,
  },
  {
    id: 2,
    completedAt: new Date('2026-05-12T12:00:00Z'),
    liftId: 'bench',
    liftLabel: 'Bench',
    week: 3,
    cycleNumber: 3,
    topWeight: 225,
    topReps: 6,
    amrap: true,
    e1rm: 270,
    isPR: false,
  },
  {
    id: 3,
    completedAt: new Date('2026-05-10T12:00:00Z'),
    liftId: 'deadlift',
    liftLabel: 'Deadlift',
    week: 3,
    cycleNumber: 3,
    topWeight: 405,
    topReps: 4,
    amrap: true,
    e1rm: 460,
    isPR: false,
  },
  {
    id: 4,
    completedAt: new Date('2026-05-07T12:00:00Z'),
    liftId: 'squat',
    liftLabel: 'Squat',
    week: 2,
    cycleNumber: 3,
    topWeight: 295,
    topReps: 3,
    amrap: false,
    e1rm: 322,
    isPR: false,
  },
  {
    id: 5,
    completedAt: new Date('2026-05-05T12:00:00Z'),
    liftId: 'bench',
    liftLabel: 'Bench',
    week: 2,
    cycleNumber: 3,
    topWeight: 210,
    topReps: 3,
    amrap: false,
    e1rm: 229,
    isPR: false,
  },
];

export default function HistoryTab() {
  return <HistoryScreen history={MOCK_SESSIONS} unit="lbs" enabledLifts={MOCK_LIFTS} />;
}
