import { useRepos } from '@/data/context';
import { Redirect } from 'expo-router';

export default function Index() {
  const { lifts } = useRepos();
  const hasLifts = lifts.list().length > 0;
  return <Redirect href={hasLifts ? '/(tabs)/home' : '/onboarding'} />;
}
