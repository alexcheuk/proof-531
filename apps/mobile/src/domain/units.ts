import type { Unit } from './types';

/** NIST exact conversion: 1 lb = 0.45359237 kg. */
const KG_PER_LB = 0.45359237;
const LB_PER_KG = 1 / KG_PER_LB; // ≈ 2.20462262

export function round(weight: number, unit: Unit): number {
  if (weight <= 0) return 0;
  const step = unit === 'lbs' ? 5 : 2.5;
  return Math.round(weight / step) * step;
}

// snap=true (default): rounds to nearest plate increment. Pass snap:false for raw derived values (volume, intermediate calculations).
export function convert(
  value: number,
  fromUnit: Unit,
  toUnit: Unit,
  options?: { snap?: boolean },
): number {
  const snap = options?.snap ?? true;
  if (fromUnit === toUnit) {
    return snap ? round(value, toUnit) : value;
  }
  const inToUnit = fromUnit === 'lbs' ? value * KG_PER_LB : value * LB_PER_KG;
  return snap ? round(inToUnit, toUnit) : inToUnit;
}

export function convertAndSnap(value: number, fromUnit: Unit, toUnit: Unit): number {
  return convert(value, fromUnit, toUnit, { snap: true });
}

export function convertWeight(value: number, fromUnit: Unit, toUnit: Unit): number {
  if (fromUnit === toUnit) return value;
  return convert(value, fromUnit, toUnit, { snap: false });
}

export function displayWeight(storageValue: number, storageUnit: Unit, displayUnit: Unit): number {
  return convertAndSnap(storageValue, storageUnit, displayUnit);
}

/** Maps storage token ('lbs' | 'kg') to display glyph ('lb' | 'kg'). */
export function displayUnit(unit: Unit): 'lb' | 'kg' {
  return unit === 'lbs' ? 'lb' : 'kg';
}

export function trainingMaxFrom(oneRM: number, unit: Unit): number {
  return round(oneRM * 0.9, unit);
}

// Non-finite input falls back to '0' — NaN/Infinity must not reach the UI.
export function formatWeight(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const abs = Math.abs(rounded);
  if (abs < 1000) return `${sign}${abs}`;
  return `${sign}${abs.toLocaleString('en-US')}`;
}
