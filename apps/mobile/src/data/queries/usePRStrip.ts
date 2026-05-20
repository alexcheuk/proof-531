import { useQuery } from '@tanstack/react-query';
import { epley, isPR } from '../../domain/e1rm';
import { useRepos } from '../context';
import { queryKeys } from './keys';

export type PRStripEntry = {
  liftId: string;
  e1rm: number;
  isPR: boolean;
};

/**
 * For each lift the user has performed completed sets on, compute the
 * current best e1RM (Epley) and whether that best is a new PR vs prior history.
 *
 * Implementation notes:
 * - Only completed sets (actualReps != null && completedAt != null) count.
 * - We join sets to sessions in memory to resolve lift_id. This is fine
 *   for the data volume of a personal training log; if it ever isn't, push
 *   the join into the repo layer.
 */
export function usePRStrip() {
  const { sets, sessions } = useRepos();
  return useQuery({
    queryKey: queryKeys.prStrip,
    queryFn: (): PRStripEntry[] => {
      const allSets = sets.list();
      const allSessions = sessions.list();
      const sessionById = new Map<number, (typeof allSessions)[number]>();
      for (const s of allSessions) {
        sessionById.set(s.id, s);
      }

      const byLift = new Map<string, number[]>();
      for (const s of allSets) {
        if (s.actualReps == null || s.completedAt == null) continue;
        const session = sessionById.get(s.sessionId);
        if (!session) continue;
        const e1 = epley(s.prescribedWeight, s.actualReps);
        const arr = byLift.get(session.liftId);
        if (arr) {
          arr.push(e1);
        } else {
          byLift.set(session.liftId, [e1]);
        }
      }

      const out: PRStripEntry[] = [];
      for (const [liftId, history] of byLift) {
        const sorted = [...history].sort((a, b) => b - a);
        const current = sorted[0];
        if (current === undefined) continue;
        const past = sorted.slice(1);
        out.push({ liftId, e1rm: current, isPR: isPR(current, past) });
      }
      return out;
    },
  });
}
