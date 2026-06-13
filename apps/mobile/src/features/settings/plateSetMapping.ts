// 'custom' is a disabled "soon" affordance  -  it is never persisted; callers guard on null from uiToSchemaPlateSet.
import type { PlateSet } from '@/domain/types';

export type PlateSetUi = 'standard' | 'metric' | 'custom';

export function schemaToUiPlateSet(value: PlateSet): PlateSetUi {
  return value === 'kg-standard' ? 'metric' : 'standard';
}

export function uiToSchemaPlateSet(value: PlateSetUi): PlateSet | null {
  if (value === 'standard') return 'standard';
  if (value === 'metric') return 'kg-standard';
  return null;
}
