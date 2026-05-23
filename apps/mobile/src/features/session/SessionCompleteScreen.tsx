import { useSession } from '@/data/queries/useSession';
import { useSetLogsForSession } from '@/data/queries/useSetLogsForSession';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { SectionBand } from '@/design/primitives/SectionBand';
import { TitleBlock } from '@/design/primitives/TitleBlock';
import { useTheme } from '@/design/theme';
import { estimateOneRm } from '@/domain/epley';
import { liftDisplayName, weekLabel } from '@/domain/labels';
import { formatDateLabel, formatElapsed, volumeOfWorkingSets } from '@/domain/summary';
import type { Lift, SetLog, Unit, Week } from '@/domain/types';
import { convertWeight, displayUnit, displayWeight } from '@/domain/units';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
/**
 * Session complete screen — the "stamped receipt" surface shown after the
 * Live screen completes (or the Today Complete pill is tapped).
 *
 * Structural port of `~/Development/531-pwa/src/features/session/
 * SessionCompleteScreen.tsx`, trimmed to the PE-06 MVP surface: DateStamp +
 * title block + receipt rows + (optional) PRCertificate + "Close the day"
 * CTA. The PWA hosts a cycle-position grid and a secondary "See full record"
 * link here as well — those track follow-up tasks.
 *
 * Side effect (done_when): on mount, if any logged set carries `isPR === true`
 * we fire `Haptics.notificationAsync('success')` exactly once. A ref guard
 * prevents the haptic from firing twice across a re-render (`StrictMode`).
 *
 * Boundary: composes design primitives + data query hooks. No drizzle
 * imports, no hex literals. Route shell at
 * `apps/mobile/src/app/session/complete.tsx` is a thin wrapper that parses
 * `sessionId` from the query string.
 */
import { useEffect, useRef } from 'react';
import { Text as RNText, ScrollView, View, type ViewStyle } from 'react-native';
import { DateStamp } from './components/DateStamp';
import { PRCertificate } from './components/PRCertificate';
import { ReceiptRow } from './components/ReceiptRow';
import { SessionLayout } from './components/SessionLayout';

export type SessionCompleteScreenProps = {
  sessionId: number;
};

export function SessionCompleteScreen({ sessionId }: SessionCompleteScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const sessionQuery = useSession(sessionId);
  const setLogsQuery = useSetLogsForSession(sessionId);

  // Detect PR on the working/AMRAP logs. Compute eagerly so we can fire
  // the success haptic in the effect below — the effect itself stays stable.
  // Drizzle returns `isPR: boolean | null` and `estimated1RM: number | null`;
  // the domain `SetLog` shape uses `undefined` instead, so we normalize at
  // the boundary here (single hop — no widening downstream).
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

  // Date stamp parts — `endedAt` is set on the happy path. Fall back to a
  // `TODAY`-ish stamp if the user lands here on an in-progress session.
  const stampTs = session.endedAt ?? null;
  const stampDate = stampTs ? new Date(stampTs) : null;
  const stampParts = stampDate
    ? formatDateLabel(stampDate)
    : { weekday: 'TODAY', dateLine: '', year: String(new Date().getFullYear()) };

  // PR side calculations — the cert needs new + prior e1RM. Without a PRs
  // accessor injection here we approximate "prior best" as zero (the cert
  // gates on `> 0`, so a freshly seeded log with isPR=true won't strand a
  // null prior into the render). Same conservative gate the PWA uses.
  //
  // e1RM is computed against storage-unit prescribed weights (set logs
  // persist in storage). For the readout we convert via `convertWeight`
  // (no snap) so derived precision survives the unit hop — snapping a
  // 297.5 lb e1RM to 300 lb would be a lie.
  const amrapLog = workingLogs.find((l) => l.kind === 'amrap');
  const newE1RMStorage =
    amrapLog && amrapLog.estimated1RM !== undefined
      ? amrapLog.estimated1RM
      : workingLogs.reduce((max, l) => {
          const v = estimateOneRm(l.prescribedWeight, l.actualReps);
          return v > max ? v : max;
        }, 0);
  const e1RMDisplay = Math.round(convertWeight(newE1RMStorage, storageUnit, renderUnit));
  // Delta is computed defensively against a missing prior best — when the
  // certificate would otherwise have nothing meaningful to subtract, we
  // suppress the panel. Prior-best lookup ships in a follow-up task; today
  // we render the cert only when both isPR is true AND there is at least
  // one positive estimated1RM observed.
  const showCertificate = hasPR && e1RMDisplay > 0;

  // Elapsed time (sub-line on receipt). Only renders on the happy path.
  // Narrow `endedAt` to a number in one place so the formatter call below
  // doesn't need a non-null assertion (biome flags `!`).
  const endedAtNum = typeof session.endedAt === 'number' ? session.endedAt : null;
  const elapsedReady =
    typeof session.startedAt === 'number' && endedAtNum !== null && endedAtNum > session.startedAt;
  const elapsedValue =
    elapsedReady && endedAtNum !== null ? formatElapsed(session.startedAt, endedAtNum) : '';

  // Top working set (index 2) drives the receipt's first row. The set log's
  // `prescribedWeight` is in storage units (the snapshot invariant); we
  // route it through `displayWeight` so the receipt's loadable number sits
  // on the user's display-unit plate grid.
  const topSet = workingLogs.find((l) => l.index === 2);
  const topWeightStorage = topSet?.prescribedWeight ?? 0;
  const topWeight = displayWeight(topWeightStorage, storageUnit, renderUnit);
  const topReps = topSet?.actualReps ?? 0;
  const topIsAmrap = topSet?.kind === 'amrap';

  // Volume — sum of working-set prescribedWeight × actualReps in storage
  // units, then convert (no snap) to the render unit. Snapping would lie
  // about the aggregate (volume is not loadable on the plate grid).
  const workingVolumeStorage = volumeOfWorkingSets(workingLogs);
  const workingVolume = Math.round(convertWeight(workingVolumeStorage, storageUnit, renderUnit));

  const sectionHeaderStyle = {
    fontFamily: 'IBMPlexMono-SemiBold',
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase' as const,
    color: colors.ink2,
    marginBottom: 8,
    paddingHorizontal: 24,
  };

  const handleClose = () => {
    router.replace('/');
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
        {/* Title row — DateStamp floats right of the title block. */}
        <View
          style={{
            paddingTop: 18,
            paddingHorizontal: 24,
            paddingBottom: 26,
            borderBottomWidth: 1,
            borderBottomColor: colors.lineStrong,
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <TitleBlock
              testID="session-complete-title"
              eyebrow={`${weekLabel(session.week as Week)} · ${
                stampDate ? `${stampParts.weekday} ${stampParts.dateLine}` : 'TODAY'
              }`}
              title={`${liftDisplayName(lift)} day.`}
              style={{
                paddingHorizontal: 0,
                paddingTop: 0,
                paddingBottom: 0,
                borderBottomWidth: 0,
              }}
            />
          </View>
          <DateStamp
            testID="session-complete-stamp"
            weekday={stampParts.weekday}
            dateLine={stampParts.dateLine}
            year={stampParts.year}
            {...(showCertificate ? { topArcLabel: '★  NEW RECORD  ★' } : {})}
          />
        </View>

        {/* PR certificate — gated on isPR + positive e1RM. */}
        {showCertificate ? (
          <PRCertificate
            testID="session-complete-cert"
            e1RM={e1RMDisplay}
            prevE1RM={0}
            delta={e1RMDisplay}
            unit={unitGlyph}
            liftLabel={lift === 'deadlift' ? 'deadlift' : lift}
          />
        ) : null}

        {/* The record — receipt rows. */}
        <View style={{ paddingTop: 24 }}>
          <RNText style={sectionHeaderStyle}>The record</RNText>
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

        {/* Reserve room above the sticky CtaBar so receipt isn't clipped. */}
        <View style={{ height: 120 }} />
      </ScrollView>
      <CtaBar>
        <PrimaryPillButton testID="session-complete-close" onPress={handleClose}>
          Close the day
        </PrimaryPillButton>
      </CtaBar>
    </SessionLayout>
  );
}
