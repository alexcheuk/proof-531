import { CustomTabBar } from '@/features/tabs/CustomTabBar';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'TODAY' }} />
      <Tabs.Screen name="history" options={{ title: 'HISTORY' }} />
      <Tabs.Screen name="settings" options={{ title: 'YOU' }} />
    </Tabs>
  );
}
