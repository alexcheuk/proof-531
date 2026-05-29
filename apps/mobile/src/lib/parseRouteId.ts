/**
 * Parse an integer route param (e.g. `sessionId`) from an expo-router
 * search-param string. Returns the parsed integer, or `null` if the param
 * is absent or not a valid integer.
 *
 * Centralises a pattern that previously appeared verbatim in every route
 * shell that received a numeric ID from the URL:
 *
 *   const parsed = id ? Number.parseInt(id, 10) : Number.NaN;
 *   if (Number.isNaN(parsed)) return null;
 */
export function parseRouteId(raw: string | string[] | undefined): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (!str) return null;
  const n = Number.parseInt(str, 10);
  return Number.isNaN(n) ? null : n;
}
