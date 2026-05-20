import type { ReactElement } from 'react';
import { useState } from 'react';
import { NumberStepper, type NumberStepperProps } from '../NumberStepper';

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

const meta: Meta<NumberStepperProps> = {
  title: 'Primitives/NumberStepper',
  component: NumberStepper,
};
export default meta;

type Story = StoryObj<NumberStepperProps>;

export const WithUnit: Story = {
  render: () => {
    const [value, setValue] = useState(225);
    return (
      <NumberStepper value={value} min={45} max={1000} step={5} unit="lb" onChange={setValue} />
    );
  },
};

export const NoUnit: Story = {
  render: () => {
    const [value, setValue] = useState(8);
    return <NumberStepper value={value} min={0} max={20} step={1} onChange={setValue} />;
  },
};

export const AtMin: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return <NumberStepper value={value} min={0} max={20} step={1} onChange={setValue} />;
  },
};

export const AtMax: Story = {
  render: () => {
    const [value, setValue] = useState(20);
    return <NumberStepper value={value} min={0} max={20} step={1} onChange={setValue} />;
  },
};
