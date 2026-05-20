import type { ReactElement } from 'react';
import { measureRenders } from 'reassure';
import { ThemeProvider } from '../../theme';
import { Barbell } from '../Barbell';
import { Chips } from '../Chips';
import { Numerical } from '../Numerical';

// Skia is a native dependency; mock for jest-node like the other plate tests.
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const passthrough = ({ children }: { children?: unknown }) =>
    React.createElement(React.Fragment, null, children);
  return {
    Canvas: passthrough,
    Group: passthrough,
    Rect: passthrough,
    RoundedRect: passthrough,
    Path: () => null,
    LinearGradient: () => null,
    vec: (x: number, y: number) => ({ x, y }),
  };
});

const wrap = (ui: ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

// Budget (per spec / task done_when):
//   - Each plate variant @ 225 lb must render in under 4ms
//   - CI flags any variant that regresses >10% from the stored baseline
// These thresholds are enforced via `@callstack/reassure-cli`'s baseline
// comparison report (see .github/workflows/ci.yml). The test bodies below
// only emit measurements; reassure produces the report from the artifact.

test('Plates/Barbell @ 225 lb', async () => {
  await measureRenders(wrap(<Barbell weight={225} />));
});

test('Plates/Chips @ 225 lb', async () => {
  await measureRenders(wrap(<Chips weight={225} />));
});

test('Plates/Numerical @ 225 lb', async () => {
  await measureRenders(wrap(<Numerical weight={225} />));
});
