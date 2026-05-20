import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Caps } from '../../primitives/Caps';
import { colors, shape } from '../../tokens';
import { ICON_NAMES, Icon, type IconProps } from '../index';

type Meta<P> = { title: string; component: (props: P) => ReactElement; args?: Partial<P> };
type StoryObj<P> = { args?: Partial<P>; render?: () => ReactElement };

const meta: Meta<IconProps> = {
  title: 'Icons/Icon',
  component: Icon,
  args: { name: 'dumbbell', size: 24, color: colors.ink0 },
};
export default meta;

type Story = StoryObj<IconProps>;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.bg0,
    padding: shape.rMd,
    gap: shape.rSm,
  },
  cell: {
    width: 72,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg1,
    borderRadius: shape.rMd,
    gap: shape.rSm,
  },
});

export const Catalog: Story = {
  render: () => (
    <View style={styles.grid}>
      {ICON_NAMES.map((name) => (
        <View key={name} style={styles.cell}>
          <Icon name={name} size={24} />
          <Caps>{name}</Caps>
        </View>
      ))}
    </View>
  ),
};

export const SingleEmber: Story = { args: { name: 'flame', size: 32, color: colors.hot } };
export const SingleLarge: Story = { args: { name: 'dumbbell', size: 48, color: colors.lime } };
