import { CapsLabel } from '@/design/primitives/CapsLabel';
import { CtaBar } from '@/design/primitives/CtaBar';
import { PrimaryPillButton } from '@/design/primitives/PrimaryPillButton';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
import { isLift } from '@/domain/labels';
import { TodayScreen } from '@/features/session/TodayScreen';
import { SessionLayout } from '@/features/session/components/SessionLayout';
import { SessionTopBar } from '@/features/session/components/SessionTopBar';
import { goTo } from '@/lib/routes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, type ViewStyle } from 'react-native';

/**
 * Thin route shell — parses `:lift` off the URL and hands it to the feature
 * component. Invalid or missing lifts now render an explicit recovery screen
 * (used to silently return null, which presented as a blank white page if the
 * user landed here via a malformed deep link or stale back-stack entry).
 */
export default function TodayRoute() {
  const { lift } = useLocalSearchParams<{ lift?: string }>();
  if (!isLift(lift)) return <InvalidLiftScreen rawLift={lift} />;
  return <TodayScreen lift={lift} />;
}

function InvalidLiftScreen({ rawLift }: { rawLift: string | undefined }) {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const wrap: ViewStyle = {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.bg0,
  };
  return (
    <SessionLayout>
      <StatusBar style="dark" />
      <SessionTopBar onBack={() => goTo.home(router)} />
      <View style={wrap} testID="today-invalid-lift">
        <CapsLabel style={{ marginBottom: spacing.md }}>Unknown lift</CapsLabel>
        <Text variant="sans" weight="bold" size={36} color="ink0" style={{ letterSpacing: -1.2 }}>
          Hmm, can't find that
          <Text variant="sans" weight="bold" size={36} color="amber">
            .
          </Text>
        </Text>
        <Text
          variant="sans"
          weight="regular"
          size={14}
          color="ink2"
          style={{ marginTop: spacing.md, maxWidth: 300, lineHeight: 21 }}
        >
          {rawLift
            ? `"${rawLift}" isn't one of the four lifts (squat, bench, deadlift, press).`
            : 'No lift was specified for this session.'}{' '}
          Head back to pick one.
        </Text>
      </View>
      <CtaBar>
        <PrimaryPillButton testID="today-invalid-back-home" onPress={() => goTo.home(router)}>
          Back to home
        </PrimaryPillButton>
      </CtaBar>
    </SessionLayout>
  );
}
