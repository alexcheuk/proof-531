import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Heading } from '@/design/primitives/Heading';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { View, type ViewStyle } from 'react-native';
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
  const { colors, layout } = useTheme();

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
      <Text
        variant="sans"
        weight="medium"
        size={14}
        color="ink2"
        style={{ lineHeight: 21, marginTop: 14, maxWidth: 280 }}
      >
        {showCertificate ? (
          <>
            {`${liftLower} day, day ${cycleDay}. `}
            <Text variant="sans" weight="bold" size={14} color="ink0">
              {`a new estimated 1RM on the ${liftLower}`}
            </Text>
            {' — the bar moved further today than ever before.'}
          </>
        ) : (
          `${liftLower} day, day ${cycleDay}. work done, weight moved, page turned.`
        )}
      </Text>
    </View>
  );
}
