/**
 * Query-key factory for react-query.
 *
 * Centralizing keys here keeps cache invalidation in mutations honest:
 * if a key shape changes, callers and invalidators update together.
 */
export const queryKeys = {
  activeCycle: ['cycle', 'active'] as const,
  cycle: (id: number) => ['cycle', id] as const,
  session: (id: number) => ['session', id] as const,
  setsBySession: (sessionId: number) => ['sets', { sessionId }] as const,
  history: ['history'] as const,
  prStrip: ['pr-strip'] as const,
};
