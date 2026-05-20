import { Icon } from '@/design/icons';
import { Text } from '@/design/primitives/Text';
import { colors, shape, type } from '@/design/tokens';
import { Pressable, View } from 'react-native';
import type { TodaySession } from './today-types';

export type TodayHeaderProps = {
  session: TodaySession;
  /**
   * Day-of-week within the cycle. Optional — defaults to `1` since the current
   * `TodaySession` shape doesn't model day-of-week yet.
   */
  day?: number;
  onOpenWatch?: () => void;
};

/**
 * Top-of-screen header for the Today routes. Renders the "531." logo with the
 * `c{cycle} · w{week} · d{day}` meta line on the left and an optional circular
 * watch (rest-timer) button on the right.
 *
 * Behavioral source: `design-reference/screens-main.jsx` `TodayHeader`
 * (line 42). The reference uses a "volume" icon for the watch button; we
 * substitute `timer` since that's the closest entry in our icon registry.
 */
export function TodayHeader({ session, day = 1, onOpenWatch }: TodayHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: shape.rLg,
        paddingTop: shape.rMd,
        paddingBottom: shape.rSm,
      }}
      testID="today-header"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: shape.rSm }}>
        <Text variant="logo">
          531
          <Text variant="logo" tone="hot">
            .
          </Text>
        </Text>
        <Text
          tone="ink3"
          style={{
            fontFamily: type.mono,
            fontSize: shape.rXs + 6, // 10
            letterSpacing: 1,
          }}
          // Keep the cycle/week/day meta accessible to the existing test that
          // asserts header content via `Cycle X · Week Y`.
          accessibilityLabel={`Cycle ${session.cycleNumber} · Week ${session.weekOfCycle}`}
        >
          {`c${session.cycleNumber} · w${session.weekOfCycle} · d${day}`}
        </Text>
      </View>
      {onOpenWatch ? (
        <Pressable
          onPress={onOpenWatch}
          accessibilityRole="button"
          accessibilityLabel="Open watch"
          testID="today-open-watch"
          style={{
            width: shape.iconButton,
            height: shape.iconButton,
            borderRadius: shape.rPill,
            backgroundColor: colors.lineFaint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="timer" size={shape.rMd + shape.rXs} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default TodayHeader;
