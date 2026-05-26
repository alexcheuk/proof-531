import { FirstLaunchGate } from '@/features/first-launch/FirstLaunchGate';
import { CustomTabBar } from '@/features/tabs/CustomTabBar';
import { Tabs } from 'expo-router';

/**
 * Tabs layout. `backBehavior="initialRoute"` so Android hardware back
 * (and the OS swipe-back gesture on iOS where it applies) routes any
 * non-Today tab back to Today, and back from Today exits the app. The
 * default `history` behaviour was confusing — backing from History
 * landed wherever you'd visited most recently, not on the obvious root.
 * See Discord 1508687777179369575 for the user's framing.
 */
export default function TabsLayout() {
  return (
    <FirstLaunchGate>
      <Tabs
        backBehavior="initialRoute"
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: 'TODAY' }} />
        <Tabs.Screen name="progress" options={{ title: 'PROGRESS' }} />
        <Tabs.Screen name="history" options={{ title: 'HISTORY' }} />
        <Tabs.Screen name="settings" options={{ title: 'YOU' }} />
      </Tabs>
    </FirstLaunchGate>
  );
}
