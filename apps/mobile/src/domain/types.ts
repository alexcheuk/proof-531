export type Lift = 'squat' | 'bench' | 'deadlift' | 'press';
export type Unit = 'lbs' | 'kg';
export type PlateSet = 'standard' | 'kg-standard';
export type Week = 1 | 2 | 3 | 4;
export type Day = 1 | 2 | 3 | 4;

export type SetLogKind = 'warmup' | 'working' | 'amrap' | 'bbb' | 'assistance' | 'tm-test';

/**
 * Sound played when the rest countdown completes.
 * 'chime' = the device's default notification sound; 'alarm' = the device's
 * default alarm sound (the one the user picked in their system Clock/Sound
 * settings), which is louder and reads as "time to lift" from across the gym.
 */
export type RestAlarmSound = 'chime' | 'alarm';

export type SetLog = {
  id?: number;
  sessionId: number;
  index: number;
  kind: SetLogKind;
  prescribedWeight: number;
  prescribedReps: number;
  actualReps: number;
  completedAt: number;
  isPR?: boolean;
  estimated1RM?: number;
};

// id is always 1  -  singleton row in the settings Drizzle table.
export interface Settings {
  id: 1;
  storageUnit: Unit;
  displayUnit: Unit;
  plateSet: PlateSet;
  enabledLifts: Lift[];
  currentCycle: number;
  week: Week;
  day: Day;
  restTargetSeconds: number;
  bbbRestTargetSeconds: number;
  /** Which sound the rest-complete alert plays (Android; iOS always uses the default sound). */
  restAlarmSound: RestAlarmSound;
  liveScreenInverted: boolean;
  /** True after the Play / App Store in-app review has been requested once. */
  storeReviewRequested: boolean;
}

export const DEFAULT_SETTINGS: Omit<Settings, 'id'> = {
  storageUnit: 'lbs',
  displayUnit: 'lbs',
  plateSet: 'standard',
  enabledLifts: ['squat', 'bench', 'deadlift', 'press'],
  currentCycle: 1,
  week: 1,
  day: 1,
  restTargetSeconds: 180,
  bbbRestTargetSeconds: 90,
  restAlarmSound: 'alarm',
  liveScreenInverted: false,
  storeReviewRequested: false,
};
