import { TopBarPill } from './TopBarPill';

export type ResetPillProps = {
  onPress: () => void;
};

export function ResetPill({ onPress }: ResetPillProps) {
  return (
    <TopBarPill
      testID="session-reset"
      accessibilityLabel="Restart session from set 1"
      onPress={onPress}
      glyph="↺"
      label="Restart"
    />
  );
}
