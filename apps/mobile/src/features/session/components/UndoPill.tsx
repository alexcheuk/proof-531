import { TopBarPill } from './TopBarPill';

export type UndoPillProps = {
  onPress: () => void;
};

export function UndoPill({ onPress }: UndoPillProps) {
  return (
    <TopBarPill
      testID="session-undo"
      accessibilityLabel="Undo the most recent working set"
      onPress={onPress}
      glyph="↶"
      label="Undo"
    />
  );
}
