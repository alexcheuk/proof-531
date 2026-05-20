import { Icon } from '@/design/icons';
import { Caps } from '@/design/primitives/Caps';
import { Text } from '@/design/primitives/Text';
import { shape } from '@/design/tokens';
import { Pressable, View } from 'react-native';
import type { TodaySession } from './today-types';

export type TodayHeaderProps = {
  session: TodaySession;
  onOpenWatch?: () => void;
};

/**
 * Top-of-screen header for the Today routes. Renders the cycle/week eyebrow
 * with the lift label, plus an optional watch (rest-timer) button on the
 * trailing edge.
 *
 * Behavioral source: `design-reference/screens-main.jsx` `TodayHeader`
 * (line 42). The reference uses a "watch" icon; we substitute `timer` since
 * that's the closest entry in our icon registry.
 */
export function TodayHeader({ session, onOpenWatch }: TodayHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: shape.rLg,
        gap: shape.rSm,
      }}
      testID="today-header"
    >
      <View style={{ flex: 1 }}>
        <Caps>{`Cycle ${session.cycleNumber} · Week ${session.weekOfCycle}`}</Caps>
        <Text variant="title">{session.liftLabel}</Text>
      </View>
      {onOpenWatch ? (
        <Pressable
          onPress={onOpenWatch}
          accessibilityRole="button"
          accessibilityLabel="Open watch"
          testID="today-open-watch"
        >
          <Icon name="timer" />
        </Pressable>
      ) : null}
    </View>
  );
}

export default TodayHeader;
