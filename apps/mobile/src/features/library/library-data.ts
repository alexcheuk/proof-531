/**
 * Library (assistance catalog) data.
 *
 * Ported from `design-reference/screens-meta.jsx:297` (LIBRARY const).
 * Static for v1 — no persistence, no edits. The screen renders this list
 * read-only grouped by category.
 */

export type LibraryItem = {
  name: string;
  category: 'push' | 'pull' | 'legs' | 'core';
  defaultSets: number;
  defaultReps: number | string;
  equipment?: string;
};

export const LIBRARY: LibraryItem[] = [
  // push
  { name: 'Dips', category: 'push', defaultSets: 5, defaultReps: 10 },
  { name: 'Push-ups', category: 'push', defaultSets: 5, defaultReps: 15 },
  {
    name: 'DB bench press',
    category: 'push',
    defaultSets: 5,
    defaultReps: 10,
    equipment: 'dumbbells',
  },
  {
    name: 'Triceps pushdown',
    category: 'push',
    defaultSets: 5,
    defaultReps: 10,
    equipment: 'cable',
  },
  // pull
  { name: 'Chin-ups', category: 'pull', defaultSets: 5, defaultReps: 10 },
  { name: 'Pull-ups', category: 'pull', defaultSets: 5, defaultReps: 10 },
  { name: 'DB row', category: 'pull', defaultSets: 5, defaultReps: 10, equipment: 'dumbbells' },
  { name: 'Face pulls', category: 'pull', defaultSets: 5, defaultReps: 15, equipment: 'cable' },
  // legs
  { name: 'Lunges', category: 'legs', defaultSets: 5, defaultReps: 10 },
  { name: 'Bulgarian split squat', category: 'legs', defaultSets: 5, defaultReps: 10 },
  { name: 'Leg press', category: 'legs', defaultSets: 5, defaultReps: 10, equipment: 'machine' },
  { name: 'Glute ham raise', category: 'legs', defaultSets: 5, defaultReps: 10, equipment: 'GHR' },
  // core
  { name: 'Hanging leg raise', category: 'core', defaultSets: 5, defaultReps: 10 },
  { name: 'Ab wheel', category: 'core', defaultSets: 5, defaultReps: 6, equipment: 'wheel' },
  { name: 'Plank', category: 'core', defaultSets: 3, defaultReps: '60s' },
];

export const CATEGORY_ORDER: ReadonlyArray<LibraryItem['category']> = [
  'push',
  'pull',
  'legs',
  'core',
];

export const CATEGORY_LABEL: Record<LibraryItem['category'], string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  core: 'Core',
};
