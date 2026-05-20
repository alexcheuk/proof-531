import { type PlateSet, SettingsScreen } from '@/features/settings/SettingsScreen';
import { useAnalyticsStore } from '@/ui-state/analyticsStore';
import { useState } from 'react';

const INITIAL_LIFTS = [
  { id: 'squat', label: 'Squat', enabled: true },
  { id: 'bench', label: 'Bench press', enabled: true },
  { id: 'deadlift', label: 'Deadlift', enabled: true },
  { id: 'press', label: 'Overhead press', enabled: true },
];

export default function SettingsTab() {
  const analyticsEnabled = useAnalyticsStore((s) => s.enabled);
  const setAnalyticsEnabled = useAnalyticsStore((s) => s.setEnabled);
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [plateSet, setPlateSet] = useState<PlateSet>('standard-lbs');
  const [lifts, setLifts] = useState(INITIAL_LIFTS);

  return (
    <SettingsScreen
      unit={unit}
      onUnitChange={setUnit}
      plateSet={plateSet}
      onPlateSetChange={setPlateSet}
      lifts={lifts}
      onToggleLift={(id) =>
        setLifts((ls) => ls.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)))
      }
      analyticsEnabled={analyticsEnabled}
      onAnalyticsChange={setAnalyticsEnabled}
    />
  );
}
