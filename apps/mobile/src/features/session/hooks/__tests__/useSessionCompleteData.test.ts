import type { Session } from '@/data/accessors/session';
import { deriveView } from '../useSessionCompleteData';

function session(overrides: Partial<Session> = {}): Session {
  return {
    id: 1,
    lift: 'squat',
    cycle: 1,
    week: 1,
    startedAt: new Date('2026-05-15T10:00:00Z').getTime(),
    endedAt: new Date('2026-05-15T10:45:00Z').getTime(),
    status: 'completed',
    trainingMaxSnapshot: 250,
    storageUnitSnapshot: 'lbs',
    displayUnitSnapshot: 'lbs',
    ...overrides,
  };
}

describe('deriveView (useSessionCompleteData)', () => {
  it('flags a PR-bearing session as showing the certificate', () => {
    const v = deriveView({
      session: session(),
      setLogsData: [
        {
          id: 1,
          sessionId: 1,
          index: 0,
          kind: 'working',
          prescribedWeight: 162.5,
          prescribedReps: 5,
          actualReps: 5,
          completedAt: 1,
          isPR: false,
          estimated1RM: null,
        },
        {
          id: 2,
          sessionId: 1,
          index: 2,
          kind: 'amrap',
          prescribedWeight: 212.5,
          prescribedReps: 5,
          actualReps: 8,
          completedAt: 2,
          isPR: true,
          estimated1RM: 269.166,
        },
      ],
      settingsData: undefined,
      prevBestStorage: 0,
    });
    expect(v.hasPR).toBe(true);
    expect(v.showCertificate).toBe(true);
    expect(v.e1RMDisplay).toBe(270);
  });

  it('does NOT show the certificate when no PR was set', () => {
    const v = deriveView({
      session: session(),
      setLogsData: [
        {
          id: 1,
          sessionId: 1,
          index: 2,
          kind: 'working',
          prescribedWeight: 212.5,
          prescribedReps: 5,
          actualReps: 5,
          completedAt: 1,
          isPR: false,
          estimated1RM: null,
        },
      ],
      settingsData: undefined,
      prevBestStorage: 0,
    });
    expect(v.hasPR).toBe(false);
    expect(v.showCertificate).toBe(false);
  });

  it('falls back to working-set Epley max when no AMRAP exists', () => {
    const v = deriveView({
      session: session(),
      setLogsData: [
        {
          id: 1,
          sessionId: 1,
          index: 2,
          kind: 'working',
          prescribedWeight: 200,
          prescribedReps: 5,
          actualReps: 5,
          completedAt: 1,
          isPR: false,
          estimated1RM: null,
        },
      ],
      settingsData: undefined,
      prevBestStorage: 0,
    });
    // 200 × (1 + 5/30) = 233.33 → snaps to nearest 5lb → 235.
    expect(v.e1RMDisplay).toBe(235);
  });

  it('clamps cycle position to sessionsInCycle even for very high weeks', () => {
    const v = deriveView({
      session: session({ week: 4 }),
      setLogsData: [],
      settingsData: undefined,
      prevBestStorage: 0,
    });
    expect(v.sessionsInCycle).toBe(16);
    expect(v.completedThisCycle).toBeLessThanOrEqual(16);
  });

  it('honors enabledLifts from settings when sizing the cycle grid', () => {
    const v = deriveView({
      session: session({ lift: 'squat', week: 1 }),
      setLogsData: [],
      settingsData: {
        id: 1,
        storageUnit: 'lbs',
        displayUnit: 'lbs',
        plateSet: 'standard',
        enabledLifts: ['squat', 'bench'],
        currentCycle: 1,
        week: 1,
        day: 1,
        restTargetSeconds: 90,
        bbbRestTargetSeconds: 90,
        liveScreenInverted: false,
        storeReviewRequested: false,
      },
      prevBestStorage: 0,
    });
    expect(v.sessionsInCycle).toBe(8); // 2 lifts × 4 weeks
  });

  it('rolls up BBB rows: bbbSetsCompleted counts them, bbbWeightDisplay reads the first row', () => {
    const v = deriveView({
      session: session(),
      setLogsData: [
        // One working set to keep workingLogs honest.
        {
          id: 1,
          sessionId: 1,
          index: 0,
          kind: 'working',
          prescribedWeight: 200,
          prescribedReps: 5,
          actualReps: 5,
          completedAt: 1,
          isPR: false,
          estimated1RM: null,
        },
        // 5 BBB rows at 150 lb × 10.
        ...Array.from({ length: 5 }, (_, i) => ({
          id: 10 + i,
          sessionId: 1,
          index: i,
          kind: 'bbb' as const,
          prescribedWeight: 150,
          prescribedReps: 10,
          actualReps: 10,
          completedAt: 100 + i,
          isPR: false,
          estimated1RM: null,
        })),
      ],
      settingsData: undefined,
      prevBestStorage: 0,
    });
    expect(v.bbbSetsCompleted).toBe(5);
    expect(v.bbbWeightDisplay).toBe(150);
    // Working volume must NOT include BBB  -  that's the receipt's contract.
    expect(v.workingVolume).toBe(1000); // 200 × 5
  });

  it('reports zero BBB when the user skipped (no bbb rows)', () => {
    const v = deriveView({
      session: session(),
      setLogsData: [
        {
          id: 1,
          sessionId: 1,
          index: 0,
          kind: 'working',
          prescribedWeight: 200,
          prescribedReps: 5,
          actualReps: 5,
          completedAt: 1,
          isPR: false,
          estimated1RM: null,
        },
      ],
      settingsData: undefined,
      prevBestStorage: 0,
    });
    expect(v.bbbSetsCompleted).toBe(0);
    expect(v.bbbWeightDisplay).toBe(0);
  });

  it('computes e1RM delta against the prior PR for the lift', () => {
    const v = deriveView({
      session: session(),
      setLogsData: [
        {
          id: 1,
          sessionId: 1,
          index: 2,
          kind: 'amrap',
          prescribedWeight: 200,
          prescribedReps: 5,
          actualReps: 10,
          completedAt: 1,
          isPR: true,
          estimated1RM: 266.667,
        },
      ],
      settingsData: undefined,
      prevBestStorage: 250,
    });
    // New = 265 (266.667 snapped to nearest 5lb), prev = 250 → delta = 15.
    expect(v.e1RMDelta).toBe(15);
  });
});
