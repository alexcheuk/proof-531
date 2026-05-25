import { TopBarPill } from './TopBarPill';

export type CompletePillProps = {
  onPress: () => void;
};

export function CompletePill({ onPress }: CompletePillProps) {
  return (
    <TopBarPill
      testID="session-complete"
      accessibilityLabel="Complete session"
      accessibilityHint="Files this session to history and closes the day"
      onPress={onPress}
      label="Complete session"
      variant="filled"
    />
  );
}
