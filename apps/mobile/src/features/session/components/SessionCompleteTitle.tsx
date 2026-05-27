import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { DateStamp } from './DateStamp';

export type SessionCompleteTitleProps = {
  completedThisCycle: number;
  eyebrowDate: string;
  weekday: string;
  dateLine: string;
  year: string;
  /** When true, renders "★ NEW RECORD ★" on the DateStamp arc. */
  showCertificate: boolean;
  liftLower: string;
  /** The cycle day number (1–4). Called `week` in the raw session row for legacy reasons. */
  cycleDay: number;
};

/**
 * The big "In the / book." headline + DateStamp + paragraph that sits below
 * the receipt masthead. Pure presentational — all values arrive pre-derived
 * from `useSessionCompleteData`.
 */
export function SessionCompleteTitle({
  completedThisCycle,
  eyebrowDate,
  weekday,
  dateLine,
  year,
  showCertificate,
  liftLower,
  cycleDay,
}: SessionCompleteTitleProps) {
  const { colors, layout, type } = useTheme();

  const titleSection: ViewStyle = {
    paddingTop: 18,
    paddingHorizontal: layout.gutter,
    paddingBottom: 26,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineStrong,
  };
  const titleRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
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

  return (
    <View style={titleSection}>
      <CapsLabel weight="semibold" style={{ marginBottom: 10 }}>
        {`Session № ${String(completedThisCycle).padStart(2, '0')} · ${eyebrowDate}`}
      </CapsLabel>
      <View style={titleRow}>
        <Heading size="xl" style={{ flex: 1 }} testID="session-complete-title">
          {'In the\nbook'}
          <Text variant="sans" weight="bold" size={64} color="amber" style={{ lineHeight: 74 }}>
            .
          </Text>
        </Heading>
        <DateStamp
          testID="session-complete-stamp"
          weekday={weekday}
          dateLine={dateLine}
          year={year}
          {...(showCertificate ? { topArcLabel: '★  NEW RECORD  ★' } : {})}
        />
      </View>
      <RNText style={titleSubtext}>
        {showCertificate ? (
          <>
            {`${liftLower} day, day ${cycleDay}. `}
            <RNText style={titleSubtextStrong}>{`a new estimated 1RM on the ${liftLower}`}</RNText>
            {' — the bar moved further today than ever before.'}
          </>
        ) : (
          `${liftLower} day, day ${cycleDay}. work done, weight moved, page turned.`
        )}
      </RNText>
    </View>
  );
}
