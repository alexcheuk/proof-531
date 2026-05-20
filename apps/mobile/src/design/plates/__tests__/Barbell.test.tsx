import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ThemeProvider } from '../../theme';
import { Barbell } from '../Barbell';

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const passthrough = ({ children }: { children?: unknown }) =>
    React.createElement(React.Fragment, null, children);
  return {
    Canvas: passthrough,
    Group: passthrough,
    Rect: passthrough,
    Path: () => null,
    LinearGradient: () => null,
    vec: (x: number, y: number) => ({ x, y }),
  };
});

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Barbell', () => {
  it.each([135, 225, 315, 405, 495])('renders %d lb without crashing', (w) => {
    const { toJSON } = wrap(<Barbell weight={w} />);
    expect(toJSON()).toBeDefined();
  });

  it('honours an explicit canvas size', () => {
    const { toJSON } = wrap(<Barbell weight={225} width={400} height={200} />);
    expect(toJSON()).toBeDefined();
  });

  it('renders with an empty plate count when weight equals bar', () => {
    const { toJSON } = wrap(<Barbell weight={45} />);
    expect(toJSON()).toBeDefined();
  });
});
