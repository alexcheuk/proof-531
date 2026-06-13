import { Stack } from 'expo-router';

/**
 * Stack layout for the session route group (Today / Live / Complete). The
 * tab bar is intentionally hidden here  -  a session is a focused, full-screen
 * workflow.
 */
export default function SessionLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
