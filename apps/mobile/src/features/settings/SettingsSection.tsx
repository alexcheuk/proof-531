import { Caps } from '@/design/primitives/Caps';
import { shape } from '@/design/tokens';
import type { ReactNode } from 'react';
import { View } from 'react-native';

export type SettingsSectionProps = {
  title: string;
  children: ReactNode;
  testID?: string;
};

export function SettingsSection({ title, children, testID }: SettingsSectionProps) {
  return (
    <View testID={testID} style={{ gap: shape.rSm }}>
      <Caps>{title}</Caps>
      <View style={{ gap: shape.rXs }}>{children}</View>
    </View>
  );
}

export default SettingsSection;
