export type PlateInventoryEntry = {
  size: number;
  count: number;
};

export type CalcPlatesInput = {
  target: number;
  bar: number;
  inventory: readonly PlateInventoryEntry[];
};

export type CalcPlatesResult = {
  plates: number[];
  remainder: number;
};

const EPSILON = 1e-6;

export function calcPlates(input: CalcPlatesInput): CalcPlatesResult {
  const { target, bar, inventory } = input;

  if (!Number.isFinite(target) || target < 0) {
    throw new Error(`calcPlates: target must be finite and >= 0, got ${target}`);
  }
  if (!Number.isFinite(bar) || bar < 0) {
    throw new Error(`calcPlates: bar must be finite and >= 0, got ${bar}`);
  }
  for (const { size, count } of inventory) {
    if (!Number.isFinite(size) || size <= 0) {
      throw new Error(`calcPlates: inventory.size must be finite and > 0, got ${size}`);
    }
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(`calcPlates: inventory.count must be a non-negative integer, got ${count}`);
    }
  }

  if (target <= bar + EPSILON) {
    return { plates: [], remainder: +(target - bar).toFixed(2) };
  }

  const perSideTarget = (target - bar) / 2;
  const sorted = [...inventory].sort((a, b) => b.size - a.size);

  let remaining = perSideTarget;
  const plates: number[] = [];

  for (const { size, count } of sorted) {
    let used = 0;
    while (used < count && remaining + EPSILON >= size) {
      plates.push(size);
      remaining -= size;
      used += 1;
    }
  }

  const remainder = +(remaining * 2).toFixed(2);
  return { plates, remainder };
}
