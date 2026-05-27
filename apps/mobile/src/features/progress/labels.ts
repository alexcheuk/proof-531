import type { Lift } from '@/domain/types';

/**
 * Colloquial lift name used in the Progress hero ("on the back squat"). Lower-
 * case — caps/text-transform is applied at render time. Distinct from
 * `liftDisplayName` (Title case, short) and the `Lift` token itself; the
 * Progress headline is the only consumer today, but the phrasing is the
 * coach's voice and should not bleed into the generic name helpers.
 */
export function liftLongName(lift: Lift): string {
  switch (lift) {
    case 'squat':
      return 'back squat';
    case 'bench':
      return 'bench press';
    case 'deadlift':
      return 'deadlift';
    case 'press':
      return 'overhead press';
  }
}
