import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ThemeProvider } from '../../theme';
import { ProgressRing } from '../ProgressRing';

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const passthrough = ({ children }: { children?: unknown }) =>
    React.createElement(React.Fragment, null, children);
  return {
    Canvas: passthrough,
    Path: () => null,
    Skia: { Path: { Make: () => ({ addCircle() {}, addArc() {} }) } },
  };
});

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ProgressRing', () => {
  it.each([0, 0.25, 0.5, 0.75, 1])('renders progress %s without crashing', (p) => {
    const { getByTestId } = wrap(<ProgressRing progress={p} />);
    expect(getByTestId('progress-ring')).toBeTruthy();
  });

  it('clamps progress above 1', () => {
    const { getByLabelText } = wrap(<ProgressRing progress={2} />);
    expect(getByLabelText('100 percent')).toBeTruthy();
  });

  it('clamps progress below 0', () => {
    const { getByLabelText } = wrap(<ProgressRing progress={-1} />);
    expect(getByLabelText('0 percent')).toBeTruthy();
  });

  it('honours explicit size and stroke overrides', () => {
    const { getByTestId } = wrap(<ProgressRing progress={0.5} size={80} stroke={6} />);
    expect(getByTestId('progress-ring')).toBeTruthy();
  });
});
