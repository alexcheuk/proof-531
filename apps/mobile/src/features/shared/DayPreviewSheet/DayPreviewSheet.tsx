import { useSessions } from '@/data/queries/useSessions';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Sheet } from '@/design/primitives/Sheet';
import { useTheme } from '@/design/theme';
import { daySchemeLabel, liftDisplayName } from '@/domain/labels';
import { formatRelativeTime } from '@/domain/relativeTime';
import { prescription, tmTestSet } from '@/domain/schemes';
import type { Lift, PlateSet, Unit, Week } from '@/domain/types';
import { convert, displayUnit } from '@/domain/units';
import { BbbBand } from '@/features/session/components/TodayBody/BbbBand';
import { TmTestNote } from '@/features/session/components/TodayBody/TmTestNote';
import { TopSetHero } from '@/features/session/components/TodayBody/TopSetHero';
import { WarmupsBand } from '@/features/session/components/TodayBody/WarmupsBand';
// The four prescription bands live in features/session/ and are referenced by
// alias — the same cross-feature pattern WorkingSetsBand already uses for
// SetRow (see the design spec's boundary note). `check-boundaries` permits
// this (it gates hex, domain purity, drizzle, gorhom index, and barrels —
// not the shared→session direction). WorkingSetsBand itself is in
// features/shared/.
import { WorkingSetsBand } from '@/features/shared/WorkingSetsBand';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { LoggedRepsBlock } from './LoggedRepsBlock';

export type DayPreviewSheetProps = {
  open: boolean;
  lift: Lift;
  cycle: number;
  week: Week;
  /** Storage unit of the TM — drives snap math (same contract as TodayBody). */
  storageUnit: Unit;
  /** Display unit; defaults to storageUnit when omitted. */
  displayUnit?: Unit;
  tm: number;
  plateSet: PlateSet;
  /**
   * When this day is a COMPLETED PAST day, the session id whose logged reps
   * become the mini-receipt. null/undefined → prescription only (current,
   * future, or uncompleted day). The completed-vs-prescription mode is derived
   * from this being non-null — no separate boolean flag.
   */
  sessionId?: number | null;
  onDismiss: () => void;
  testID?: string;
};

const SNAP_POINTS = ['85%'];

/**
 * Read-only bottom sheet that previews any (lift, cycle, week)'s full
 * prescription — warmups, working sets, BBB, plus a plate viz on the top set.
 * No session creation, no DB write. When `sessionId` is non-null the day is a
 * completed past day and the sheet additionally shows the actual logged reps
 * (mini-receipt) beneath the working sets.
 *
 * Composes the prescription bands directly (NOT TodayBody) so it carries none
 * of TodayBody's full-screen chrome (Masthead, today's-date TitleBlock,
 * last-trained line, "END OF SESSION" caption) — those assume the current day
 * in a session context, which is wrong for an arbitrary preview.
 */
export function DayPreviewSheet({
  open,
  lift,
  cycle,
  week,
  storageUnit,
  displayUnit: displayUnitProp,
  tm,
  plateSet,
  sessionId,
  onDismiss,
  testID,
}: DayPreviewSheetProps) {
  const { spacing, layout } = useTheme();
  const renderUnit: Unit = displayUnitProp ?? storageUnit;
  const unitGlyph = displayUnit(renderUnit);
  const tmInDisplay = convert(tm, storageUnit, renderUnit);

  const isCompletedPast = sessionId != null;
  const isTmTestDay = week === 4;

  // Logs only matter for the completed-past mini-receipt. The hook resolves
  // [] for a null id and is gated by `enabled: sessionId != null`, so calling
  // it unconditionally is safe; the prescription never waits on it.
  const logs = useSetLogsForSession(sessionId ?? null);
  const sessions = useSessions();

  const loggedRelative = useMemo<string | null>(() => {
    if (!isCompletedPast) return null;
    const row = sessions.data?.find((s) => s.id === sessionId);
    return row ? formatRelativeTime(row.startedAt) : null;
  }, [isCompletedPast, sessions.data, sessionId]);

  // Hero is the AMRAP top set (index 2) on weeks 1-3, the single TM-test set
  // on week 4. `prescription` returns a fixed 3-length array so [2] is always
  // present; the guard narrows the type and never fires at runtime.
  const heroSet = isTmTestDay ? tmTestSet() : prescription(week)[2];
  if (!heroSet) return null;

  return (
    <Sheet
      open={open}
      onDismiss={onDismiss}
      snapPoints={SNAP_POINTS}
      {...(testID !== undefined ? { testID } : {})}
    >
      <ScrollView
        accessibilityLabel={`Day preview, ${liftDisplayName(lift)}, cycle ${cycle} week ${week}`}
        testID="day-preview-scroll"
      >
        <View
          style={{
            paddingHorizontal: layout.gutter,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
          }}
        >
          <CapsLabel weight="semibold" testID="day-preview-header">
            {`${liftDisplayName(lift).toUpperCase()} · C${cycle} · W${week} · ${daySchemeLabel(week)}`}
          </CapsLabel>
          {isCompletedPast ? (
            <CapsLabel
              size="xs"
              color="ink3"
              style={{ marginTop: 4 }}
              testID="day-preview-logged-caption"
            >
              {loggedRelative ? `LOGGED ${loggedRelative}` : 'LOGGED'}
            </CapsLabel>
          ) : null}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <TopSetHero
            set={heroSet}
            tm={tm}
            storageUnit={storageUnit}
            renderUnit={renderUnit}
            unitGlyph={unitGlyph}
            tmInDisplay={tmInDisplay}
            plateSet={plateSet}
            {...(isTmTestDay
              ? { eyebrow: 'TM TEST', pctLabel: '100% TM', repsRange: [3, 5] as const }
              : {})}
          />
        </View>

        <WarmupsBand
          tm={tm}
          storageUnit={storageUnit}
          renderUnit={renderUnit}
          unitGlyph={unitGlyph}
          week={week}
        />

        {isTmTestDay ? (
          <TmTestNote />
        ) : (
          <>
            <WorkingSetsBand
              sets={prescription(week)}
              tm={tm}
              storageUnit={storageUnit}
              renderUnit={renderUnit}
              unitGlyph={unitGlyph}
              tmInDisplay={tmInDisplay}
              completedIndices={[]}
            />

            {isCompletedPast ? (
              <LoggedRepsBlock
                logs={logs.data ?? []}
                unit={renderUnit}
                isLoading={logs.isLoading}
                isError={logs.isError}
              />
            ) : null}

            <BbbBand
              tm={tm}
              storageUnit={storageUnit}
              renderUnit={renderUnit}
              unitGlyph={unitGlyph}
            />
          </>
        )}
      </ScrollView>
    </Sheet>
  );
}
