import { ThemeProvider } from '@/design/theme';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View: RN.View, Text: RN.Text },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (v: unknown) => v,
    withDelay: (_d: unknown, v: unknown) => v,
    cancelAnimation: () => {},
    Easing: {
      out: () => () => 0,
      inOut: () => () => 0,
      ease: () => 0,
      cubic: () => 0,
    },
  };
});

import { PRCertificate } from '../PRCertificate';

const renderCert = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('PRCertificate', () => {
  it('renders the eyebrow + Stronger headline', () => {
    const screen = renderCert(
      <PRCertificate e1RM={300} prevE1RM={285} delta={15} unit="lb" liftLabel="squat" />,
    );
    expect(screen.getByText('★  A new record  ★')).toBeTruthy();
    // "Stronger by" appears in ComparisonRow too; assert at least one match.
    expect(screen.queryAllByText(/Stronger/).length).toBeGreaterThanOrEqual(1);
  });

  it('exposes a composed a11y label including the lift, e1RM, unit, and delta', () => {
    const screen = renderCert(
      <PRCertificate
        e1RM={300}
        prevE1RM={285}
        delta={15}
        unit="lb"
        liftLabel="squat"
        testID="cert"
      />,
    );
    const panel = screen.getByTestId('cert');
    expect(panel.props.accessibilityLabel).toBe(
      'A new record on the squat: 300 lb estimated 1RM, stronger by 15 lb.',
    );
  });

  it('omits comparison row and delta from a11y label when prevE1RM is 0 (first-ever PR)', () => {
    const screen = renderCert(
      <PRCertificate
        e1RM={280}
        prevE1RM={0}
        delta={280}
        unit="lb"
        liftLabel="bench"
        testID="cert"
      />,
    );
    expect(screen.queryByText('Previous best')).toBeNull();
    expect(screen.queryByText('Stronger by')).toBeNull();
    const panel = screen.getByTestId('cert');
    expect(panel.props.accessibilityLabel).toBe('A new record on the bench: 280 lb estimated 1RM.');
  });

  it('omits comparison row when delta is 0 (sub-increment improvement)', () => {
    const screen = renderCert(
      <PRCertificate
        e1RM={280}
        prevE1RM={280}
        delta={0}
        unit="lb"
        liftLabel="press"
        testID="cert"
      />,
    );
    expect(screen.queryByText('Previous best')).toBeNull();
    expect(screen.queryByText('Stronger by')).toBeNull();
  });

  it('flows props through to HeroNumberRow + ComparisonRow + SignOffRow', () => {
    const screen = renderCert(
      <PRCertificate
        e1RM={142}
        prevE1RM={138}
        delta={4}
        unit="kg"
        liftLabel="bench"
        testID="cert"
      />,
    );
    // HeroNumberRow renders e1RM + unit + "est. 1rm" caption.
    expect(screen.getByText('142')).toBeTruthy();
    expect(screen.getByText('est. 1rm')).toBeTruthy();
    // ComparisonRow renders previous best + delta hero with sign.
    expect(screen.getByText('Previous best')).toBeTruthy();
    expect(screen.getByText(/138/)).toBeTruthy();
    expect(screen.getByTestId('cert-delta').props.children).toBe('+4');
    // SignOffRow renders the lift label.
    expect(screen.getByText('On the bench')).toBeTruthy();
  });

  it('renders the testID-suffixed sub-targets when testID is given', () => {
    const screen = renderCert(
      <PRCertificate
        e1RM={200}
        prevE1RM={190}
        delta={10}
        unit="lb"
        liftLabel="press"
        testID="cert"
      />,
    );
    expect(screen.getByTestId('cert-e1rm')).toBeTruthy();
    expect(screen.getByTestId('cert-delta')).toBeTruthy();
  });
});
