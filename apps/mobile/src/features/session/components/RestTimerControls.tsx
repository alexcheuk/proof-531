import { CapsLabel } from '@/design/primitives/CapsLabel';
import { Row } from '@/design/primitives/Row';
import { useTheme } from '@/design/theme';
import type { ColorToken } from '@/design/tokens';
import * as Haptics from 'expo-haptics';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

export type RestTimerControlsProps = {
  onAddRest?: (() => void) | undefined;
  onSubRest?: (() => void) | undefined;
  onSkip?: (() => void) | undefined;
};

/**
 * The ±30s / Skip chip row underneath the RestTimer clock. Each button
 * fires a light haptic before invoking its handler. Each chip is omitted
 * when its handler is undefined.
 */
export function RestTimerControls({ onAddRest, onSubRest, onSkip }: RestTimerControlsProps) {
  const { colors, spacing } = useTheme();
  const showAny = onAddRest !== undefined || onSubRest !== undefined || onSkip !== undefined;
  if (!showAny) return null;

  const chipBase: ViewStyle = {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ink0,
    backgroundColor: colors.bg0,
  };
  const chipPrimary: ViewStyle = { ...chipBase, backgroundColor: colors.ink0 };
  return (
    <Row gap="sm" style={{ marginTop: spacing.lg }} testID="rest-timer-controls">
      {onSubRest ? (
        <Chip
          testID="rest-timer-sub"
          a11y="Subtract 30 seconds"
          onPress={onSubRest}
          style={chipBase}
          color="ink0"
        >
          −30s
        </Chip>
      ) : null}
      {onAddRest ? (
        <Chip
          testID="rest-timer-add"
          a11y="Add 30 seconds"
          onPress={onAddRest}
          style={chipBase}
          color="ink0"
        >
          +30s
        </Chip>
      ) : null}
      {onSkip ? (
        <Chip
          testID="rest-timer-skip"
          a11y="Skip rest and start the next set"
          onPress={onSkip}
          style={chipPrimary}
          color="bg0"
        >
          Skip ›
        </Chip>
      ) : null}
    </Row>
  );
}

type ChipProps = {
  testID: string;
  a11y: string;
  onPress: () => void;
  style: StyleProp<ViewStyle>;
  color: ColorToken;
  children: string;
};

function Chip({ testID, a11y, onPress, style, color, children }: ChipProps) {
  const handle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={handle}
      style={style}
    >
      <CapsLabel weight="semibold" size="md" color={color} style={{ letterSpacing: 1.8 }}>
        {children}
      </CapsLabel>
    </Pressable>
  );
}
