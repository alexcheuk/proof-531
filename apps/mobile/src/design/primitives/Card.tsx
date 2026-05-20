import type React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import { colors, shape } from '../tokens';

export type CardProps = {
  children?: React.ReactNode;
  padded?: boolean;
  interactive?: boolean;
  onPress?: () => void;
  testID?: string;
};

export function Card({ children, padded = true, interactive = false, onPress, testID }: CardProps) {
  const style: ViewStyle = {
    backgroundColor: colors.bg1,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: shape.rMd,
    ...(padded ? { padding: shape.rMd } : null),
  };
  if (interactive || onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={style} testID={testID}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={style} testID={testID}>
      {children}
    </View>
  );
}

export default Card;
