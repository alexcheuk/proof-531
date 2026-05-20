import type { ReactElement } from 'react';
import { useState } from 'react';
import { SegRail, type SegRailProps } from '../SegRail';

// Local Meta/StoryObj helpers — @storybook/react-native v8 does not re-export
// these from @storybook/react, so we define minimal CSF-3 shapes here.
type Meta<P> = {
  title: string;
  component: (props: P) => ReactElement;
  args?: Partial<P>;
};
type StoryObj<P> = {
  args?: Partial<P>;
  render?: () => ReactElement;
};

const meta: Meta<SegRailProps<string>> = {
  title: 'Primitives/SegRail',
  component: SegRail as (props: SegRailProps<string>) => ReactElement,
};
export default meta;

type Story = StoryObj<SegRailProps<string>>;

export const StringOptions: Story = {
  render: () => {
    const [value, setValue] = useState<'a' | 'b' | 'c'>('a');
    return <SegRail options={['a', 'b', 'c'] as const} value={value} onChange={setValue} />;
  },
};

export const ObjectOptions: Story = {
  render: () => {
    type V = 'lbs' | 'kg';
    const [value, setValue] = useState<V>('lbs');
    return (
      <SegRail<V>
        options={[
          { value: 'lbs', label: 'Pounds' },
          { value: 'kg', label: 'Kilograms' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const FiveOptions: Story = {
  render: () => {
    type V = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
    const [value, setValue] = useState<V>('wed');
    return (
      <SegRail<V>
        options={['mon', 'tue', 'wed', 'thu', 'fri'] as const}
        value={value}
        onChange={setValue}
      />
    );
  },
};
