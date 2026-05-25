import { Stack } from 'expo-router';

/**
 * Stack layout for the Progress route group. The tab bar is hidden — the
 * Progress screen is a stack-pushed sub-screen of TODAY, not a tab.
 */
export default function ProgressLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
