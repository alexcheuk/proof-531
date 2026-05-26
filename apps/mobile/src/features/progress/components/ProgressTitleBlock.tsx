import { useTheme } from '@/design/theme';
import type { Lift } from '@/domain/types';
import { Text as RNText, View } from 'react-native';
import { liftLongName } from '../labels';

/**
 * Hero strip at the top of each Progress lift page — eyebrow ("ON THE BACK
 * SQUAT") + display heading ("Progress."). Matches the canonical design at
 * `_workspace/00_input/canonical-progress-v3.jsx`.
 */
export function ProgressTitleBlock({ lift }: { lift: Lift }) {
  const { colors, layout, type } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: layout.gutter,
        paddingTop: 14,
        paddingBottom: 22,
        borderBottomWidth: 1,
        borderBottomColor: colors.lineStrong,
      }}
    >
      <RNText
        style={{
          fontFamily: `${type.mono}-SemiBold`,
          fontSize: 10,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          color: colors.ink2,
          marginBottom: 8,
        }}
      >
        {`On the ${liftLongName(lift)}`}
      </RNText>
      <RNText
        style={{
          fontFamily: `${type.sans}-Bold`,
          fontSize: 56,
          lineHeight: 52,
          letterSpacing: -2.24,
          color: colors.ink0,
        }}
      >
        Progress.
      </RNText>
    </View>
  );
}
