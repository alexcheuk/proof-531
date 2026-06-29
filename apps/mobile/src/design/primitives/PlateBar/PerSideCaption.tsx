import { Fragment } from 'react';
import { Text as RNText, type TextStyle, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import type { PlateGroup } from './plateMath';

export type PerSideCaptionProps = {
  grouped: ReadonlyArray<PlateGroup>;
  total: number;
  unitGlyph: string;
  testID?: string;
};

export function PerSideCaption({ grouped, total, unitGlyph, testID }: PerSideCaptionProps) {
  const { colors, spacing } = useTheme();

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  };
  const labelStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 2.2,
    color: colors.ink2,
    textTransform: 'uppercase',
  };
  const valueRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  };
  const numStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 13,
    lineHeight: 14,
    letterSpacing: -0.13,
    color: colors.ink0,
  };
  const countStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 11,
    lineHeight: 14,
    color: colors.ink2,
  };
  const plusStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 13,
    lineHeight: 14,
    color: colors.ink3,
  };
  const totalStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Bold',
    fontSize: 13,
    lineHeight: 14,
    color: colors.ink0,
    marginLeft: 4,
  };
  const dashStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Medium',
    fontSize: 13,
    lineHeight: 14,
    color: colors.ink2,
  };

  return (
    <View style={rowStyle} {...(testID !== undefined ? { testID } : {})}>
      <RNText style={labelStyle}>PER SIDE</RNText>
      <View style={valueRowStyle}>
        {grouped.length === 0 ? (
          <RNText style={dashStyle}> - </RNText>
        ) : (
          <>
            {grouped.map((g, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: positional render of a grouped stack
              <Fragment key={`g-${i}`}>
                {i > 0 ? <RNText style={plusStyle}>+</RNText> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {g.count > 1 ? <RNText style={countStyle}>{`${g.count}× `}</RNText> : null}
                  <RNText style={numStyle}>{g.weight}</RNText>
                </View>
              </Fragment>
            ))}
            <RNText style={totalStyle}>{`= ${total} ${unitGlyph}`}</RNText>
          </>
        )}
      </View>
    </View>
  );
}
