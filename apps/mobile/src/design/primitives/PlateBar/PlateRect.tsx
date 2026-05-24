import { Text as RNText, type TextStyle, View } from 'react-native';

export type PlateRectProps = {
  weight: number;
  height: number;
  width: number;
  mini: boolean;
  ink0: string;
  bg0: string;
  testID: string | undefined;
};

/**
 * Single rectangular plate. Stamps the weight number (rotated -90°) only
 * when the plate is tall and wide enough that the label is legible.
 */
export function PlateRect({ weight, height, width, mini, ink0, bg0, testID }: PlateRectProps) {
  const showLabel = height >= 30 && width >= 10;
  const labelStyle: TextStyle = {
    fontFamily: 'IBMPlexMono-Bold',
    fontSize: mini ? 7 : 10,
    lineHeight: mini ? 7 : 8,
    letterSpacing: 1,
    color: bg0,
  };
  // The label sits inside a wrapper whose width matches the plate's HEIGHT
  // (its long axis post-rotation). Without that, RN measures the Text
  // against the plate's narrow width and truncates the decimal.
  return (
    <View
      testID={testID}
      style={{
        width,
        height,
        backgroundColor: ink0,
        borderRadius: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {showLabel ? (
        <View
          pointerEvents="none"
          style={{
            width: height,
            height: width,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: '-90deg' }],
          }}
        >
          <RNText style={labelStyle} numberOfLines={1}>
            {weight}
          </RNText>
        </View>
      ) : null}
    </View>
  );
}
