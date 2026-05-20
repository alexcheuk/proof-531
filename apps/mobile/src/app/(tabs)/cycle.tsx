import { CycleScreen, type CycleScreenProps } from '@/features/cycle/CycleScreen';

const MOCK: CycleScreenProps = {
  cycleNumber: 3,
  weekOfCycle: 2,
  lifts: [
    { id: 'squat', label: 'Squat', trainingMax: 275 },
    { id: 'bench', label: 'Bench', trainingMax: 195 },
    { id: 'deadlift', label: 'Deadlift', trainingMax: 345 },
    { id: 'press', label: 'Press', trainingMax: 125 },
  ],
  completedSessions: [
    { week: 1, liftId: 'squat' },
    { week: 1, liftId: 'bench' },
    { week: 1, liftId: 'deadlift' },
    { week: 1, liftId: 'press' },
    { week: 2, liftId: 'squat' },
  ],
  unit: 'lbs',
};

export default function CycleTab() {
  return <CycleScreen {...MOCK} />;
}
