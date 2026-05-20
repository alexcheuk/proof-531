import { Caps } from '@/design/primitives/Caps';
import { Text } from '@/design/primitives/Text';
import { colors, shape } from '@/design/tokens';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

export type SettingRowProps = {
  label: string;
  value?: string;
  hint?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  testID?: string;
};

export function SettingRow({ label, value, hint, trailing, onPress, testID }: SettingRowProps) {
  const content = (
    <>
      <View style={{ flex: 1, gap: shape.rXs }}>
        <Caps>{label}</Caps>
        {hint ? (
          <Text variant="small" tone="ink2">
            {hint}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="small" tone="ink1">
          {value}
        </Text>
      ) : null}
      {trailing ? <View>{trailing}</View> : null}
    </>
  );

  const containerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: shape.rMd,
    paddingHorizontal: shape.rLg,
    backgroundColor: colors.bg1,
    borderRadius: shape.rSm,
    gap: shape.rSm,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        testID={testID}
        style={containerStyle}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View testID={testID} style={containerStyle}>
      {content}
    </View>
  );
}

export default SettingRow;
