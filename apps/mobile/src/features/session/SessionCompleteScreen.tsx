import { useSession } from '@/data/queries/useSession';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import { useSettings } from '@/data/queries/useSettings';
import { CtaBar } from '@/design/primitives/CtaBar';
import { MonoBadge } from '@/design/primitives/MonoBadge';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SectionBand } from '@/design/primitives/SectionBand';
import { useTheme } from '@/design/theme';
import { estimateOneRm } from '@/domain/epley';
import { formatDateLabel, formatElapsed, volumeOfWorkingSets } from '@/domain/summary';
import type { Lift, SetLog, Unit } from '@/domain/types';
import { convertWeight, displayUnit, displayWeight } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
/**
 * Session complete screen — the "stamped receipt" surface shown after the
 * Live screen completes (or the Today Complete pill is tapped).
 *
 * Structural port of `~/Development/531-pwa/src/features/session/
 * SessionCompleteScreen.tsx` (Rev 5). The PWA layout shipped here:
 *   - Masthead: `531 . ledger` wordmark + `Filed` chip
 *   - Title block: eyebrow (`Session № NN · Day · Date`), giant
 *     `In the / book.` headline, DateStamp, sub-paragraph
 *   - Optional PRCertificate (inverted-ink panel)
 *   - The record (receipt rows)
 *   - Cycle position grid
 *   - CTA region: `Close the day` + secondary `See full record →`
 *
 * Side effect (done_when): on mount, if any logged set carries `isPR === true`
 * we fire `Haptics.notificationAsync('success')` exactly once.
 */
import { useEffect, useRef } from 'react';
import { Text as RNText, ScrollView, type TextStyle, View, type ViewStyle } from 'react-native';
import { DateStamp } from './components/DateStamp';
import { PRCertificate } from './components/PRCertificate';
import { ReceiptRow } from './components/ReceiptRow';
import { SessionLayout } from './components/SessionLayout';

export type SessionCompleteScreenProps = {
  sessionId: number;
};

export function SessionCompleteScreen({ sessionId }: SessionCompleteScreenProps) {
  const router = useRouter();
  const { colors, type } = useTheme();
  const sessionQuery = useSession(sessionId);
  const setLogsQuery = useSetLogsForSession(sessionId);
  const settingsQuery = useSettings();

  // Detect PR on the working/AMRAP logs. Compute eagerly so we can fire
  // the success haptic in the effect below.
  const rawLogs = setLogsQuery.data ?? [];
  const logs: SetLog[] = rawLogs.map((l) => ({
    id: l.id,
    sessionId: l.sessionId,
    index: l.index,
    kind: l.kind,
    prescribedWeight: l.prescribedWeight,
    prescribedReps: l.prescribedReps,
    actualReps: l.actualReps,
    completedAt: l.completedAt,
    isPR: l.isPR ?? false,
    ...(l.estimated1RM != null ? { estimated1RM: l.estimated1RM } : {}),
  }));
  const workingLogs = logs.filter((l) => l.kind === 'working' || l.kind === 'amrap');
  const hasPR = workingLogs.some((l) => l.isPR === true);

  // One-shot success haptic on first render where a PR is observed.
  const hapticFiredRef = useRef(false);
  useEffect(() => {
    if (!hasPR || hapticFiredRef.current) return;
    hapticFiredRef.current = true;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hasPR]);

  const scrollStyle: ViewStyle = { flex: 1, backgroundColor: colors.bg0 };

  if (!sessionQuery.data) {
    return (
      <SessionLayout>
        <StatusBar style="dark" />
      </SessionLayout>
    );
  }

  const session = sessionQuery.data;
  const lift = session.lift as Lift;
  const storageUnit: Unit = session.storageUnitSnapshot ?? 'lbs';
  const renderUnit: Unit = session.displayUnitSnapshot ?? storageUnit;
  const unitGlyph = displayUnit(renderUnit);
  const liftLower = lift === 'deadlift' ? 'deadlift' : lift;

  // Date stamp parts — `endedAt` is set on the happy path.
  const stampTs = session.endedAt ?? null;
  const stampDate = stampTs ? new Date(stampTs) : null;
  const stampParts = stampDate
    ? formatDateLabel(stampDate)
    : { weekday: 'TODAY', dateLine: '', year: String(new Date().getFullYear()) };
  // Title-case the date string for the eyebrow ("Mon · May 19").
  const eyebrowDate = stampDate
    ? `${stampParts.weekday[0]}${stampParts.weekday.slice(1).toLowerCase()} · ${
        stampParts.dateLine[0]
      }${stampParts.dateLine.slice(1).toLowerCase()}`
    : 'Today';

  // e1RM — derived from the AMRAP log when present; otherwise the heaviest
  // Epley estimate across working sets. Round once for display.
  const amrapLog = workingLogs.find((l) => l.kind === 'amrap');
  const newE1RMStorage =
    amrapLog && amrapLog.estimated1RM !== undefined
      ? amrapLog.estimated1RM
      : workingLogs.reduce((max, l) => {
          const v = estimateOneRm(l.prescribedWeight, l.actualReps);
          return v > max ? v : max;
        }, 0);
  const e1RMDisplay = Math.round(convertWeight(newE1RMStorage, storageUnit, renderUnit));
  const showCertificate = hasPR && e1RMDisplay > 0;

  // Elapsed time.
  const endedAtNum = typeof session.endedAt === 'number' ? session.endedAt : null;
  const elapsedReady =
    typeof session.startedAt === 'number' && endedAtNum !== null && endedAtNum > session.startedAt;
  const elapsedValue =
    elapsedReady && endedAtNum !== null ? formatElapsed(session.startedAt, endedAtNum) : '';

  // Top working set drives the receipt's first row.
  const topSet = workingLogs.find((l) => l.index === 2);
  const topWeightStorage = topSet?.prescribedWeight ?? 0;
  const topWeight = displayWeight(topWeightStorage, storageUnit, renderUnit);
  const topReps = topSet?.actualReps ?? 0;
  const topIsAmrap = topSet?.kind === 'amrap';

  // Volume.
  const workingVolumeStorage = volumeOfWorkingSets(workingLogs);
  const workingVolume = Math.round(convertWeight(workingVolumeStorage, storageUnit, renderUnit));

  // Cycle position math — falls back to 4-lift defaults if settings haven't
  // loaded (matches PWA conservative behavior).
  const enabledLifts = settingsQuery.data?.enabledLifts ?? ['squat', 'bench', 'deadlift', 'press'];
  const sessionsInCycle = (enabledLifts.length || 4) * 4;
  const liftPos = Math.max(0, enabledLifts.indexOf(lift));
  const completedThisCycle = Math.min(
    sessionsInCycle,
    Math.max(1, (session.week - 1) * enabledLifts.length + (liftPos + 1)),
  );

  const handleClose = () => {
    router.replace('/');
  };

  // ---------- styles ----------
  const mastheadWrap: ViewStyle = {
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const wordmarkRow: ViewStyle = { flexDirection: 'row', alignItems: 'center' };
  const wordmark531: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 13,
    lineHeight: 13,
    letterSpacing: 1.82,
    textTransform: 'uppercase',
    color: colors.ink0,
  };
  const wordmarkDot: TextStyle = {
    fontFamily: `${type.mono}-Bold`,
    fontSize: 13,
    color: colors.ink3,
  };
  const wordmarkLedger: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink3,
    marginLeft: 10,
  };
  const titleSection: ViewStyle = {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineStrong,
  };
  const titleEyebrow: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 10,
  };
  const titleRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  };
  const titleHeadline: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: 64,
    lineHeight: 60,
    letterSpacing: -2.88,
    color: colors.ink0,
    flex: 1,
  };
  const titleSubtext: TextStyle = {
    fontFamily: `${type.sans}-Medium`,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink2,
    marginTop: 14,
    maxWidth: 280,
  };
  const titleSubtextStrong: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    color: colors.ink0,
  };
  const sectionHeader: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    marginBottom: 8,
    paddingHorizontal: 24,
  };
  const cycleHeaderRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 24,
  };
  const cycleHeaderLabel: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
  };
  const cycleHeaderHint: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.ink3,
  };
  const cycleGridFrame: ViewStyle = {
    marginHorizontal: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  };
  const cycleGridRow: ViewStyle = {
    flexDirection: 'row',
    gap: 4,
  };
  const cycleCellBase: ViewStyle = {
    flex: 1,
    height: 16,
  };
  const cycleWeekLabelsRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  };
  const cycleWeekLabel: TextStyle = {
    fontFamily: `${type.mono}-Medium`,
    fontSize: 9,
    letterSpacing: 1.62,
    textTransform: 'uppercase',
    color: colors.ink3,
  };
  const secondaryLinkStyle: TextStyle = {
    fontFamily: `${type.mono}-SemiBold`,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.ink2,
    textAlign: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  };

  return (
    <SessionLayout>
      <StatusBar style="dark" />
      <ScrollView
        testID="session-complete-scroll"
        style={scrollStyle}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Masthead */}
        <View style={mastheadWrap} testID="session-complete-masthead">
          <View style={wordmarkRow}>
            <RNText style={wordmark531}>531</RNText>
            <RNText style={wordmarkDot}>.</RNText>
            <RNText style={wordmarkLedger}>ledger</RNText>
          </View>
          <MonoBadge size="md">Filed</MonoBadge>
        </View>

        {/* Title block */}
        <View style={titleSection}>
          <RNText style={titleEyebrow}>
            {`Session № ${String(completedThisCycle).padStart(2, '0')} · ${eyebrowDate}`}
          </RNText>
          <View style={titleRow}>
            <RNText style={titleHeadline} testID="session-complete-title">
              {'In the\nbook.'}
            </RNText>
            <DateStamp
              testID="session-complete-stamp"
              weekday={stampParts.weekday}
              dateLine={stampParts.dateLine}
              year={stampParts.year}
              {...(showCertificate ? { topArcLabel: '★  NEW RECORD  ★' } : {})}
            />
          </View>
          <RNText style={titleSubtext}>
            {showCertificate ? (
              <>
                {`${liftLower} day, week ${session.week}. `}
                <RNText style={titleSubtextStrong}>
                  {`a new estimated 1RM on the ${liftLower}`}
                </RNText>
                {' — the bar moved further today than ever before.'}
              </>
            ) : (
              `${liftLower} day, week ${session.week}. work done, weight moved, page turned.`
            )}
          </RNText>
        </View>

        {/* PR certificate — gated on isPR + positive e1RM. */}
        {showCertificate ? (
          <PRCertificate
            testID="session-complete-cert"
            e1RM={e1RMDisplay}
            prevE1RM={0}
            delta={e1RMDisplay}
            unit={unitGlyph}
            liftLabel={liftLower}
          />
        ) : null}

        {/* The record — receipt rows. */}
        <View style={{ paddingTop: 24 }}>
          <RNText style={sectionHeader}>The record</RNText>
          <SectionBand
            testID="session-complete-receipt"
            tone="strong"
            padding="none"
            style={{ paddingHorizontal: 24 }}
          >
            <ReceiptRow
              testID="receipt-top"
              first
              label="Top set"
              value={`${topWeight} × ${topReps}${topIsAmrap ? '+' : ''}`}
              sub={`${unitGlyph}`}
            />
            {topIsAmrap ? (
              <ReceiptRow
                testID="receipt-e1rm"
                label="Est. 1rm"
                value={`${e1RMDisplay}`}
                sub={`${unitGlyph}`}
              />
            ) : null}
            <ReceiptRow
              testID="receipt-volume"
              label="Volume"
              value={`${workingVolume.toLocaleString()}`}
              sub={`${unitGlyph} · working sets`}
            />
            {elapsedReady ? (
              <ReceiptRow
                testID="receipt-elapsed"
                label="Elapsed"
                value={elapsedValue}
                sub="minutes"
              />
            ) : null}
          </SectionBand>
        </View>

        {/* Cycle position */}
        <View style={{ paddingTop: 24 }}>
          <View style={cycleHeaderRow}>
            <RNText style={cycleHeaderLabel}>
              {`Cycle № ${String(session.cycle ?? 1).padStart(2, '0')}`}
            </RNText>
            <RNText style={cycleHeaderHint}>{`${completedThisCycle} of ${sessionsInCycle}`}</RNText>
          </View>
          <View style={cycleGridFrame}>
            <View style={cycleGridRow} testID="cycle-grid">
              {Array.from({ length: sessionsInCycle }).map((_, i) => {
                const done = i < completedThisCycle;
                const justNow = i === completedThisCycle - 1;
                const fillStyle: ViewStyle = done
                  ? { backgroundColor: colors.ink0 }
                  : { borderWidth: 1, borderColor: colors.line };
                return (
                  <View
                    // biome-ignore lint/suspicious/noArrayIndexKey: positional grid cell
                    key={`cell-${i}`}
                    style={[cycleCellBase, fillStyle, justNow ? { position: 'relative' } : null]}
                    testID="cycle-cell"
                  >
                    {justNow ? (
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: -3,
                          right: -3,
                          bottom: -3,
                          borderWidth: 1,
                          borderColor: colors.ink0,
                        }}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>
            <View style={cycleWeekLabelsRow}>
              <RNText style={cycleWeekLabel}>W1</RNText>
              <RNText style={cycleWeekLabel}>W2</RNText>
              <RNText style={cycleWeekLabel}>W3</RNText>
              <RNText style={cycleWeekLabel}>W4</RNText>
            </View>
          </View>
        </View>

        {/* Reserve room above the sticky CtaBar so receipt isn't clipped. */}
        <View style={{ height: 140 }} />
      </ScrollView>
      <CtaBar>
        <PrimaryPillButton testID="session-complete-close" onPress={handleClose}>
          Close the day
        </PrimaryPillButton>
        <RNText
          testID="session-complete-history-link"
          accessibilityRole="button"
          onPress={() => router.replace('/' as never)}
          style={secondaryLinkStyle}
        >
          See full record →
        </RNText>
      </CtaBar>
    </SessionLayout>
  );
}
