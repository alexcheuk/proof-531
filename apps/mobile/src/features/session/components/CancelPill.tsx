import { TopBarPill } from './TopBarPill';

export type CancelPillProps = {
  onPress: () => void;
};

export function CancelPill({ onPress }: CancelPillProps) {
  return (
    <TopBarPill
      testID="session-cancel"
      accessibilityLabel="Cancel session"
      onPress={onPress}
      label="Cancel"
    />
  );
}
