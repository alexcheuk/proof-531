import { FirstLaunchGate } from '@/features/first-launch/FirstLaunchGate';
import { CustomTabBar } from '@/features/tabs/CustomTabBar';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <FirstLaunchGate>
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: 'TODAY' }} />
        <Tabs.Screen name="progress" options={{ title: 'PROGRESS' }} />
        <Tabs.Screen name="history" options={{ title: 'HISTORY' }} />
        <Tabs.Screen name="settings" options={{ title: 'YOU' }} />
      </Tabs>
    </FirstLaunchGate>
  );
}
