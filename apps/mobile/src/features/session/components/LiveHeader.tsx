import { MonoBadge } from '@/design/primitives/MonoBadge';
import { Text } from '@/design/primitives/Text';
import { useTheme } from '@/design/theme';
/**
 * Live screen masthead. Caps eyebrow ("ON THE BAR · SET N OF 3") tells the
 * user *this is the set you're doing right now*; large sans-bold "Set N."
 * gives the screen the same typographic weight as the Today / Rest /
 * SessionComplete titles (period-terminated, single short word). The AMRAP
 * chip sits inline with the title row so it baseline-aligns visually.
 */
import { type TextStyle, View, type ViewStyle } from 'react-native';

const TITLE_SIZE = 64;
// PWA `tracking-[-0.04em]` × 64px = -2.56 letter spacing.
const TITLE_LETTER_SPACING = -2.56;
// PWA `leading-[0.92]` ≈ 0.92 * 64 ≈ 58.88; RN clips descenders on tight
// line heights, so we bump to 74 (matches the spec note in the plan).
const TITLE_LINE_HEIGHT = 74;

export type LiveHeaderProps = {
  setIndex: 0 | 1 | 2;
  isAmrap: boolean;
  testID?: string;
  lift: string;
};

export function LiveHeader({ setIndex, isAmrap, testID, lift }: LiveHeaderProps) {
  const { colors, spacing, type } = useTheme();
  const oneBased = setIndex + 1;

  const container: ViewStyle = {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  };

  const titleRow: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  };

  const titleFontSize = 36;
  const _titleStyle: TextStyle = {
    fontFamily: `${type.sans}-Bold`,
    fontSize: titleFontSize,
    lineHeight: titleFontSize,
    letterSpacing: -1.08, // -0.03em × 36
    color: colors.ink0,
  };

  const eyebrowTestID = testID ? `${testID}-eyebrow` : undefined;
  const _titleTestID = testID ? `${testID}-title` : undefined;

  return (
    <View testID={testID} style={container}>
      <Text
        variant="mono"
        weight="semibold"
        size={10}
        color="ink2"
        style={{ textTransform: 'uppercase', letterSpacing: 2.2 }}
        {...(eyebrowTestID ? { testID: eyebrowTestID } : null)}
      >
        SET {oneBased} OF 3
      </Text>

      <View style={titleRow}>
        <Text
          variant="sans"
          weight="bold"
          size={TITLE_SIZE}
          color="ink0"
          style={{
            lineHeight: TITLE_LINE_HEIGHT,
            letterSpacing: TITLE_LETTER_SPACING,
          }}
        >
          {lift} now
          <Text
            variant="sans"
            weight="bold"
            size={TITLE_SIZE}
            color="amber"
            style={{
              lineHeight: TITLE_LINE_HEIGHT,
              letterSpacing: TITLE_LETTER_SPACING,
            }}
          >
            .
          </Text>
        </Text>

        {isAmrap ? <MonoBadge>AMRAP</MonoBadge> : null}
      </View>
    </View>
  );
}
