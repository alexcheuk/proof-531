/**
 * Plate-set UI ↔ schema mapping.
 *
 * The schema only knows `'standard' | 'kg-standard'` but the SegRail renders
 * three segments; the third (`'custom'`) is a disabled "soon" affordance and
 * is never persisted.
 */
import type { PlateSet } from '@/domain/types';

export type PlateSetUi = 'standard' | 'metric' | 'custom';

/** Map schema → UI. `'kg-standard'` is shown as `Metric`. */
export function schemaToUiPlateSet(value: PlateSet): PlateSetUi {
  return value === 'kg-standard' ? 'metric' : 'standard';
}

/**
 * Map UI → schema. `'custom'` returns `null` because it must never be
 * persisted. Callers should guard on `null` and skip the write.
 */
export function uiToSchemaPlateSet(value: PlateSetUi): PlateSet | null {
  if (value === 'standard') return 'standard';
  if (value === 'metric') return 'kg-standard';
  return null;
}
