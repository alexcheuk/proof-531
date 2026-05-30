export function parseRouteId(raw: string | string[] | undefined): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (!str) return null;
  const n = Number.parseInt(str, 10);
  return Number.isNaN(n) ? null : n;
}
